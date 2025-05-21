import React, { Fragment, useRef, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button, Tooltip, list } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import Swal from 'sweetalert2';
import { PencilSquareIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";


export function Rols() {

  function showAlert(icon = "success", title, timer = 1500) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: title,
    });
  }

  const [rolesList, setRolesL] = useState([]);
  const [permisosList, setPermisosL] = useState([]);
  const [rolesxPermisosList, setRolesxPermisosL] = useState([]);
  const [userRol, setUserRol] = useState([]);

  const [nombreRol, setNombreRol] = useState("");
  const [estado, setEstado] = useState(true);

  const [editPerms, setEditPerms] = useState([]);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const empty = () => {
    setOpen(false);
    setId("");
    setNombreRol("");
    setEstado(true);
    setEditPerms([]);
    setErrorNombre(false);
    setErrorPermisos(false);
    setLoading(false);
    getRoles();
  };

  const URLRols = "http://localhost:8080/api/roles";
  const URLPerms = "http://localhost:8080/api/permisos";
  const URLRolsxPerms = "http://localhost:8080/api/rolesxpermisos";

  const getRoles = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLRols);
      setRolesL(resp.data.roles);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de los roles: ", error);
    }
  };

  const getPerms = async () => {
    try {
      const resp = await Axios.get(URLPerms);
      setPermisosL(resp.data.permisos);
    } catch (error) {
      console.error("Error al obtener datos de los permisos: ", error);
    }
  };

  const getRolsxPerms = async () => {
    try {
      const resp = await Axios.get(URLRolsxPerms);
      setRolesxPermisosL(resp.data.rolesxpermisos);
    } catch (error) {
      console.error("Error al obtener datos de los roles x permisos: ", error);
    }
  };

  useEffect(() => {
    getRoles();
    getPerms();
    getRolsxPerms();
  }, []);

  useEffect(() => {
    if (rolesList.length > 0) {
      userRolF();
    }
  }, [rolesList]);

  const userRolF = async () => {
    const aUsuariosRoles = rolesList.map(r => {
      return {
        id: r.IdRol,
        rol: r.NombreDelRol ? r.NombreDelRol : "Rol desconocido",
        estado: r.Estado ? "Activo" : "Inactivo",
      };
    })
    setUserRol(aUsuariosRoles);
  };

  const [errorAll, setErrorAll] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorPermisos, setErrorPermisos] = useState(false);

  const postRoles = async () => {
    setErrorAll(false);
    setErrorNombre(false);
    setErrorPermisos(false);
    const valNom = /^[a-zA-ZáéíóúÁÉÍÓÚ ]{4,20}$/;
    if (!nombreRol && editPerms.length === 0) {
      setErrorNombre(true);
      setErrorPermisos(true);
      return showAlert("error", "LLene el formulario primero.");
    } else if (!nombreRol) {
      setErrorNombre(true);
      return showAlert("error", "Ingrese un nombre para el rol.");
    } else if (nombreRol != nombreRol.match(valNom)) {
      setErrorNombre(true);
      return showAlert("error", "Ingrese un nombre válido.");
    } else if ((rolesList.map((rol) => rol.NombreDelRol.toLowerCase()).includes(nombreRol.toLowerCase()))) {
      setErrorNombre(true);
      return showAlert("error", "Ese rol ya está registrado...");
    } else if (!editPerms || editPerms.length === 0) {
      setErrorPermisos(true);
      return showAlert("error", "Seleccione al menos un permiso para el rol.");
    }
    showAlert("info", "Registrando rol...");
    setOpen(false);
    setLoading(true);
    await Axios.post(URLRols, {
      NombreDelRol: nombreRol,
      Estado: true
    }).then(() => {
      setTimeout(() => {
        getRolByName();
      }, 500);
    }).catch((error) => {
      if (error.response.data.mensaje === "Ese rol ya existe...") {
        return showAlert("error", "Ese rol ya existe...")
      }
      showAlert("error", "Error al registrar el rol");
      console.error("Error al registrar el rol:", error);
    });
  };

  const getRolByName = async () => {
    await Axios.get(URLRols + `/${nombreRol}`).then((response) => {
      const nuevoRolId = response.data.rol.IdRol;
      editPerms.map(perms =>
        Axios.post(URLRolsxPerms, {
          IdRol: nuevoRolId,
          IdPermiso: perms,
        }).then(() => {
          setTimeout(() => {
            showAlert("success", "Rol registrado con éxito.");
            empty();
          }, 500);
          setLoading(false);
        }).catch((error) => {
          showAlert("error", "Error al enviar el rol");
          console.error("Error al enviar el rol:", error);
        })
      )
    }).catch((error) => {
      showAlert("error", "Error al obtener el ID del rol recién creado");
      console.error("Error al obtener el ID del rol:", error);
    });
  };

  const Edit = (val) => {
    if (val.id === 1) {
      showAlert("error", "El rol Admin no se puede modificar.");
      return setOpen(false);
    } else {
      setOpen(true);
      setEdit(true);
      setId(val.id);
      setNombreRol(val.rol);
      setEstado(val.estado);
      const idsRolsxPerms = rolesxPermisosList.filter((rxp) => rxp.IdRol === val.id).map((r) => r.IdPermiso);
      setEditPerms(idsRolsxPerms);
    }
  };

  const putRoles = async () => {
    setErrorNombre(false);
    setErrorPermisos(false);
    const valNom = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]{4,20}$/;
    if (!nombreRol) {
      setErrorNombre(true);
      return showAlert("error", "Ingrese un nombre para el rol.");
    } else if (nombreRol != nombreRol.match(valNom)) {
      setErrorNombre(true);
      return showAlert("error", "Ingrese un nombre válido.");
    } else if (rolesList.map((rol) => rol.NombreDelRol.toLowerCase()).includes(nombreRol.toLowerCase()) && nombreRol !== rolesList.filter(rol => rol.IdRol == id).map(rol => rol.NombreDelRol).toString()) {
      setErrorNombre(true);
      return showAlert("error", "Ese rol ya está registrado...");
    } else if (!editPerms || editPerms.length === 0) {
      setErrorPermisos(true);
      return showAlert("error", "Seleccione al menos un permiso para el rol.");
    }
    showAlert("info", "Actualizando rol...");
    setOpen(false);
    setLoading(true);
    await Axios.put(URLRols, {
      IdRol: id,
      NombreDelRol: nombreRol,
      Estado: true,
    }).then(() => {
      const idRolsPerms = rolesxPermisosList.filter(rxp => rxp.IdRol === id);

      const rolesxPermsToDelete = idRolsPerms.filter(idrxp => !editPerms.includes(idrxp.IdPermiso));
      const deletePromises = rolesxPermsToDelete.map(rolePerm => Axios.delete(`${URLRolsxPerms}/${rolePerm.IdRolesxpermisos}`));

      const newPermsToAdd = editPerms.filter(perm => !idRolsPerms.find(idrxp => idrxp.IdPermiso === perm));
      const addPromises = newPermsToAdd.map(perm => Axios.post(URLRolsxPerms, { IdRol: id, IdPermiso: perm }));

      Promise.all([...deletePromises, ...addPromises]).then(() => {
        setTimeout(() => {
          showAlert("success", "Rol actualizado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al actualizar el rol");
        console.error("Error al actualizar el rol:", error);
      });
    }).catch((error) => {
      showAlert("error", "Error al actualizar el rol");
      console.error("Error al actualizar el rol:", error);
    });
  };

  const switchEstado = async (id, nom) => {
    try {
      if (rolesList.some((rol) => (rol.IdRol === id && rol.IdRol === 1)) ||
        rolesList.some((rol) => (rol.IdRol === id && rol.IdRol === 2)) ||
        rolesList.some((rol) => (rol.IdRol === id && rol.IdRol === 3))) {
        showAlert("error", "Este rol no se puede desactivar.");
        return;
      }
      let est = rolesList.some((rol) => (rol.IdRol === id && rol.Estado))
      if (est) {
        est = false;
      } else {
        est = true;
      }
      showAlert("info", "Modificando estado...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLRols, {
        IdRol: id,
        NombreDelRol: nom,
        Estado: est,
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Estado modificado.");
          empty();
        }, 500);
      })
    } catch (error) {
      showAlert("error", "Error al modificar el estado.");
      console.log("Error al modificar el estado: ", error);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = userRol.filter((user) => {
    return Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Estados para el paginado
  const [currentPage, setCurrentPage] = useState(1);
  const [elementos] = useState(5); // Número de elementos por página

  // Función para manejar el cambio de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcula los elementos para la página actual
  const indexOfLastPag = currentPage * elementos;
  const indexOfFirstPag = indexOfLastPag - elementos;
  const currentPag = filteredElements.slice(indexOfFirstPag, indexOfLastPag);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Card className="formRegUsu">
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white" className="text-left">
                        {edit ? "Editar rol" : "Crear rol"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="flex justify-center grid-cols-2 gap-3">
                        <div className={`${errorNombre ? "divError" : ""} "col-span-1 mb-3"`}>
                          <Input
                            className={errorNombre ? "error" : null}
                            label="Nombre para el rol"
                            value={nombreRol}
                            onChange={(event) => setNombreRol(event.target.value)}
                          />
                        </div>
                      </div>
                      <span className={`${errorNombre ? "error" : ""} text-sm mt-3`}>Solo se permite letras y de 4 a 20 caracteres.</span>
                      <div className="gap-3 mt-3 mx-5 grid grid-cols-3 justify-items-start">
                        {permisosList.map((p) => (
                          <label key={p.IdPermiso} className="flex items-center">
                            <input
                              type="checkbox"
                              className={`${errorPermisos ? "error" : ""} h-5 w-5`}
                              id={p.IdPermiso}
                              value={p.IdPermiso}
                              label={p.NombreDelPermiso}
                              checked={editPerms.includes(p.IdPermiso)} // Comprobamos si el permiso está en editPerms
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const permisoId = p.IdPermiso;
                                setEditPerms((prevPerms) => {
                                  if (isChecked) {
                                    return [...prevPerms, permisoId]; // Agregamos el permiso a la lista si está marcado
                                  } else {
                                    return prevPerms.filter((perm) => perm !== permisoId); // Eliminamos el permiso si está desmarcado
                                  }
                                });
                              }}
                            />
                            <span className={`${errorPermisos ? "text-[rgb(240,0,0)]" : "text-gray-700"} ml-2`}>{p.NombreDelPermiso}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-center items-center mt-3">
                        <div>
                          {edit ?
                            <Button onClick={(e) => {
                              putRoles();
                            }} className="btnOrange text-white font-bold py-2 px-4 rounded me-5">
                              Editar rol
                            </Button>
                            :
                            <Button onClick={(e) => {
                              postRoles();
                            }} className="btnGreen text-white font-bold py-2 px-4 rounded me-5">
                              Crear rol
                            </Button>
                          }
                          <Button onClick={(e) => {
                            setOpen(false);
                            setLoading(true)
                            setTimeout(() => {
                              empty();
                            }, 500);
                          }} className="btnRed text-white font-bold py-2 px-4 rounded">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-2 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Roles
            <Button
              className="btnRed px-3 py-2 flex items-center border"
              onClick={() => { setOpen(true), setEdit(false); }}>
              <UserPlusIcon className="h-6 w-6 me-2" /> Nuevo rol
            </Button>
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <div className="my-2 grid grid-cols-6">
            <div className="col-start-5 col-span-2">
              <Input label="Buscar" value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value), setCurrentPage(1) }} />
            </div>
          </div>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Nombre del rol", "Estado", "Acciones"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[13px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id="IdBodyTable">
              {currentPag.map((rol) => (
                <tr key={rol.id} id={`User${rol.id}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{rol.rol}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {rol.estado === "Activo" ? (
                      <Button onClick={() => {
                        switchEstado(rol.id, rol.rol)
                      }} className="btnGreen text-white font-bold py-2 px-4 rounded-full">
                        Activo
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        switchEstado(rol.id, rol.rol)
                      }} className="btnRed text-white font-bold py-2 px-4 rounded-full">
                        Inactivo
                      </Button>
                    )}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button onClick={() => {
                      if (rol.id === 1) {
                        showAlert("error", "El rol Admin no se puede modificar.");
                        return setOpen(false);
                      } else { Edit(rol) }
                    }}
                      className="text-xs font-semibold btnFunciones btnOrange me-3">
                      <PencilSquareIcon /></Button>
                    <Tooltip placement="left-start"
                      content={
                        <div className="text-center">
                          <b>Permisos:</b><br />
                          {rolesxPermisosList
                            .filter((rxp) => rxp.IdRol === rol.id)
                            .map((r, index) => {
                              const perm = permisosList.filter((p) => p.IdPermiso === r.IdPermiso).map(p => p.NombreDelPermiso)
                              return (<span key={index}>
                                {perm}
                                {<br />}
                              </span>)
                            })}
                        </div>
                      }>
                      <Button className="text-xs font-semibold btnFunciones btnGray me-3">
                        <EyeIcon />
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="flex justify-center mt-4">
            {currentPage > 1 ? <button onClick={() =>
              currentPage > 1 ? paginate(currentPage - 1) : paginate(currentPage)
            } className='text-blue-gray-300 mx-1'>
              <ChevronLeftIcon className="w-6 h-6" />
            </button> : null}
            {[...Array(Math.ceil(filteredElements.length / elementos)).keys()].map((number) => (
              <li key={number} className="cursor-pointer mx-1 flex items-center">
                <button onClick={() => paginate(number + 1)} className={`rounded p-2 ${currentPage === number + 1 ? 'btnRed text-white' : 'bg-white text-black'}`}>
                  {number + 1}
                </button>
              </li>
            ))}
            {currentPage < filteredElements.length / elementos ? <button onClick={() =>
              currentPage < filteredElements.length / elementos ? paginate(currentPage + 1) : paginate(currentPage)
            } className='text-blue-gray-300 mx-1'>
              <ChevronRightIcon className="w-6 h-6" />
            </button> : null}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
export default Rols;