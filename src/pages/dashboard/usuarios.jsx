import React, { Fragment, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import { UserPlusIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import Select from 'react-select';

export function Usuarios() {

  //funcion para las alertas
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
      title: title
    });
  }

  //Listas
  const [usuariosList, setUsuariosL] = useState([]);
  const [rolesList, setRolesL] = useState([]);
  const [usuariosRolesList, setUsuariosRolesList] = useState([]);

  //Variables
  const [roles, setRoles] = useState("");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [selectRol, setSelectRol] = useState(null);
  const rolOptions = rolesList.filter(r => r.Estado === true).map(r => ({ value: r.IdRol, label: r.NombreDelRol }));

  //Variables para marcar errores en los input
  const [errorAll, setErrorAll] = useState(false);
  const [errorRol, setErrorRol] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorApellidos, setErrorApellidos] = useState(false);
  const [errorCelular, setErrorCelular] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [errorConfirmPass, setErrorConfirmPass] = useState(false);

  //Variables para editar
  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  //Links de las API
  const URLUsuarios = "http://localhost:8080/api/usuarios";
  const URLRoles = "http://localhost:8080/api/roles";
  // http://localhost:8080//

  //Endpoint o métodos get
  const getUsuarios = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLUsuarios);
      setUsuariosL(resp.data.usuarios);
      setLoading(false);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los usuarios.");
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  const getRoles = async () => {
    try {
      const resp = await Axios.get(URLRoles);
      setRolesL(resp.data.roles);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los roles.");
      console.error("Error al obtener datos de los roles:", error);
    }
  };
  useEffect(() => {
    getUsuarios();
    getRoles();
  }, [])

  //Para cargar los get
  useEffect(() => {
    if (usuariosList.length > 0 && rolesList.length > 0) {
      usuariosRoles();
    }
  }, [usuariosList, rolesList]);

  const usuariosRoles = async () => {
    const aUsuariosRoles = usuariosList.map(u => {
      const rol = rolesList.find(r => r.IdRol === u.IdRol);
      return {
        idUsuario: u.IdUsuario,
        idRol: u.IdRol,
        rol: rol ? rol.NombreDelRol : "Rol desconocido",
        usuario: u.Usuario,
        estado: u.Estado ? "Activo" : "Inactivo",
        nombre: u.Nombre,
        apellido: u.Apellidos,
        celular: u.Celular,
        correo: u.Correo,
        pass: u.Pass
      };
    })
    setUsuariosRolesList(aUsuariosRoles);
  };

  //Endpoint o método post
  const postUsuario = async () => {
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,25}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    setErrorAll(false);
    setErrorRol(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    if (roles == 0 && !usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      return setErrorAll(true);
    } else if (roles == 0) {
      showAlert("error", "Seleccione un rol primero.");
      setErrorRol(true);
    } else if (!usuario) {
      showAlert("error", "Ingrese un nombre de usuario.");
      setErrorUsuario(true);
    } else if (usuario != usuario.match(valUsu)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario).includes(usuario)) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Ingrese su nombre.");
      setErrorNombre(true);
    } else if (nombre != nombre.match(valNomApe)) {
      showAlert("error", "Ingrese un nombre válido.");
      setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Ingrese sus apellidos.");
      setErrorApellidos(true);
    } else if (apellidos != apellidos.match(valNomApe)) {
      showAlert("error", "Ingrese apellidos válido.");
      setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Ingrese su número de celular.");
      setErrorCelular(true);
    } else if (celular != celular.match(valCel)) {
      showAlert("error", "Ingrese un número de celular válido.");
      setErrorCelular(true);
    } else if (usuariosList.some(user => user.Celular === celular)) {
      showAlert("error", "Ese número de celular ya está registrado...");
      setErrorCelular(true);
    } else if (!correo) {
      showAlert("error", "Ingrese un correo.");
      setErrorCorreo(true);
    } else if (correo != correo.match(valEm)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else if (usuariosList.map((user) => user.Correo).includes(correo)) {
      showAlert("error", "Ese correo ya está registrado...");
      setErrorCorreo(true);
    } else if (pass != pass.match(valPa)) {
      showAlert("error", "Ingrese una contraseña válida.");
      setErrorPass(true);
    } else if (confirmPass != pass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      setErrorConfirmPass(true);
    } else {
      showAlert("info", "Registrando usuario...");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLUsuarios, {
        IdRol: roles,
        Usuario: usuario,
        Estado: true,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: celular,
        Correo: correo,
        Pass: pass,
      }).then(async () => {
        setTimeout(() => {
          if (roles === 1) {
            showAlert("success", "Administrador registrado.");
          } else if (roles === 2) {
            showAlert("success", "Empleado registrado.");
          } else if (roles === 3) {
            showAlert("success", "Cliente registrado.");
          } else { showAlert("success", "Usuario registrado."); }
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al registrar el usuario.");
        return console.error("Error al registrar el usuario:", error);
      });
    }
  }

  //Endpoint o método put
  const putUsuario = async () => {
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,20}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    setErrorAll(false);
    setErrorRol(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    if (roles == 0 && !usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      return setErrorAll(true);
    } else if (roles == 0) {
      showAlert("error", "Seleccione un rol primero.");
      setErrorRol(true);
    } else if (!usuario) {
      showAlert("error", "Ingrese un nombre de usuario.");
      setErrorUsuario(true);
    } else if (usuario != usuario.match(valUsu)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario).includes(usuario) && usuario !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Usuario).toString()) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Ingrese su nombre.");
      setErrorNombre(true);
    } else if (nombre != nombre.match(valNomApe)) {
      showAlert("error", "Ingrese un nombre válido.");
      setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Ingrese sus apellidos.");
      setErrorApellidos(true);
    } else if (apellidos != apellidos.match(valNomApe)) {
      showAlert("error", "Ingrese apellidos válido.");
      setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Ingrese su número de celular.");
      setErrorCelular(true);
    } else if (!valCel.test(celular)) {
      showAlert("error", "Ingrese un número de celular válido.");
      setErrorCelular(true);
    } else if (usuariosList.some(user => user.Celular === celular && user.IdUsuario !== id)) {
      showAlert("error", "Ese número de celular ya está registrado...");
      setErrorCelular(true);
      return;
    } else if (!correo) {
      showAlert("error", "Ingrese un correo.");
      setErrorCorreo(true);
    } else if (correo != correo.match(valEm)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else if (usuariosList.map((user) => user.Correo).includes(correo) && correo !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Correo).toString()) {
      showAlert("error", "Ese correo ya está registrado...");
      setErrorCorreo(true);
    } else if (pass != pass.match(valPa) && pass != "") {
      showAlert("error", "Ingrese una contraseña válida.");
      setErrorPass(true);
    } else if (confirmPass != pass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      setErrorConfirmPass(true);
    } else {
      showAlert("info", "Actualizando información...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLUsuarios, {
        IdUsuario: id,
        IdRol: roles,
        Usuario: usuario,
        Estado: true,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: celular,
        Correo: correo,
        Pass: pass
      }).then(async () => {
        setTimeout(() => {
          showAlert("success", "Usuario actualizado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "error al actualizar el usuario.");
        console.error("Error al actualizar el usuario:", error);
      });
    }
  }

  //Para cambiar los input a modo editar
  const Edit = async (val) => {
    setErrorAll(false);
    setErrorRol(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    setEdit(true);
    setId(val.idUsuario);
    setUsuario(val.usuario);
    setRoles(val.idRol);
    setSelectRol({ value: rolesList.find(r => r.NombreDelRol === val.rol).IdRol, label: val.rol });
    setNombre(val.nombre);
    setApellidos(val.apellido);
    setCorreo(val.correo);
    setCelular(val.celular);
    setPass("");
    setConfirmPass("");
    setOpen(true);
  };

  //Variable y función para ver la contraseña
  const [ver, setVer] = useState(true);
  const toggleVer = () => {
    setVer(!ver)
  }

  //Función para vaciar las variables
  const empty = async () => {
    setId(0);
    setOpen(false);
    setErrorAll(false);
    setErrorRol(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    setUsuario("");
    setRoles("");
    setNombre("");
    setApellidos("");
    setCelular("");
    setCorreo("");
    setPass("");
    setConfirmPass("");
    setSelectRol(null);
    setVer(true);
    setEdit(false);
    setLoading(false);
    getUsuarios();
  };

  //Cambiar estado
  const switchEstado = async (id) => {
    const user = usuariosList.find(u => u.IdUsuario === id)
    if (usuariosList.some((user) => (user.IdUsuario === id && user.IdUsuario === 1))) {
      return showAlert("error", "Este usuario no se puede desactivar.");
    }
    if (usuariosList.filter(u => u.IdRol === 2 && u.Estado == true && user.IdRol === 2 && user.Estado == true).length == 1) {
      return showAlert("error", "No puede haber menos de un barbero activo.", 2000);
    }
    let est = usuariosList.some((user) => (user.IdUsuario === id && user.Estado))
    if (est) {
      est = false;
    } else {
      est = true;
    }
    try {
      showAlert("info", "Modificando estado...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLUsuarios + `/${id}`, {
        IdUsuario: id,
        Estado: est,
      }).then(async () => {
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

  function formatNumCel(number) {
    const fstSegment = number.substring(0, 3);
    const sndSegment = number.substring(3, 6);
    const trdSegment = number.substring(6, 10);
    const formatCel = `(${fstSegment}) ${sndSegment}-${trdSegment}`;
    return formatCel;
  }

  const [searchTerm, setSearchTerm] = useState("");
  // Estados para el paginado
  const [currentPage, setCurrentPage] = useState(1);
  const [elementos] = useState(5); // Número de elementos por página

  // Filtrar valores según el término de búsqueda
  const filteredElements = usuariosRolesList.filter((user) => {
    return Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
            leaveTo="opacity-0"
          >
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
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <Card className="">
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white">
                        {edit ? ("Editar Usuario") : ("Crear usuario")}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`${errorRol || errorAll ? "divError" : ""} col-span-1`}>
                          <Select
                            placeholder="Seleccione un rol"
                            isSearchable
                            className={`${errorRol || errorAll ? "error" : ""}`}
                            value={selectRol}
                            options={rolOptions}
                            isDisabled={id == 1}
                            onChange={id == 1 ? null : (selRol) => {
                              setSelectRol(selRol);
                              setRoles(selRol.value);
                            }} />
                        </div>
                        <div className={`${errorUsuario || errorAll ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorUsuario || errorAll ? "error" : ""}`}
                            label="Usuario"
                            value={usuario}
                            onChange={(event) => setUsuario(event.target.value)} />
                          <span className={`${errorAll || errorUsuario ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe tener de 3 a 20 caracteres y al menos una mayúscula.</span>
                        </div>
                        <div className={`${errorNombre || errorAll ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorNombre || errorAll ? "error" : ""}`}
                            label="Nombre"
                            value={nombre}
                            onChange={(event) => setNombre(event.target.value)} />
                        </div>
                        <div className={`${errorApellidos || errorAll ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorApellidos || errorAll ? "error" : ""}`}
                            label="Apellido"
                            value={apellidos}
                            onChange={(event) => setApellidos(event.target.value)} />
                        </div>
                        <div>
                          <div className={`${errorCelular || errorAll || celular.length > 10 ? "divError" : ""} flex items-center relative col-span-1`}>
                            <Input
                              className={`${errorCelular || errorAll || celular.length > 10 ? "error" : ""} pr-[60px]`}
                              label="Celular"
                              value={celular}
                              onChange={(event) => setCelular(event.target.value)}
                              type="number" />
                            <span className={`${errorCelular || errorAll || celular.length > 10 ? "text-[rgb(240,0,0)!important]" : ""} absolute right-3 text-black`}>{celular.length}/10</span>
                          </div>
                          <div className="flex">
                            <span className={`${errorAll || errorCelular ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-xs pl-1 mt-1`}>Debe ser un número de 10 dígitos.</span>
                          </div>
                        </div>
                        <div className={`${errorCorreo || errorAll ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorCorreo || errorAll ? "error" : ""}`}
                            label="Correo"
                            value={correo}
                            onChange={(event) => setCorreo(event.target.value)}
                            type="email" />
                          <div className="flex">
                            <span className={`${errorAll || errorCorreo ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-xs pl-1 mt-1`}>Ejemplo@gmail.com</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <div className={`${pass.length > 30 || errorPass || errorAll ? "divError" : ""} col-span-1 flex items-center relative`}>
                            <Input
                              className={`${pass.length > 99 ? "pr-[95px]" : "pr-[85px]"} ${pass.length > 30 || errorPass || errorAll ? "error" : ""}`}
                              label="Contraseña"
                              value={pass}
                              onChange={(event) => setPass(event.target.value)}
                              type={ver ? "password" : "text"} />
                            <span className={`${pass.length > 30 || errorPass || errorAll ? "text-[rgb(240,0,0)!important]" : ""} absolute right-10 text-black`}>{pass.length}/30</span>
                            <button className={`${pass.length > 30 || errorPass || errorAll ? "text-[rgb(240,0,0)!important]" : ""} ml-2 text-black absolute right-3`} onClick={toggleVer}>{ver ? <EyeIcon className="h-5" /> : <EyeSlashIcon className="h-5" />}</button>
                          </div>
                          <div className="flex">
                            <span className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : "text-gray-700 "} text-xs pl-1 mt-1`}>Debe tener de 8 a 30 caracteres, al menos una mayúscula y un número.</span>
                          </div>
                        </div>
                        <div className={`${errorConfirmPass || errorAll ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorConfirmPass || errorAll ? "error" : ""}`}
                            label="Confirmar contraseña"
                            value={confirmPass}
                            onChange={(event) => setConfirmPass(event.target.value)}
                            type={ver ? "password" : "text"} />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mt-3">
                        {edit ? (
                          <div>
                            <Button onClick={() => { putUsuario() }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded">
                              Editar usuario
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => { postUsuario() }} className="btnGreen text-white font-bold py-2 px-4 rounded">
                            Crear usuario
                          </Button>
                        )}
                        <Button onClick={(e) => {
                          setOpen(false);
                          setLoading(true)
                          setTimeout(() => {
                            empty();
                          }, 500);
                        }} className="btnRed text-white font-bold py-2 px-4 rounded ms-5">
                          Cancelar
                        </Button>
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
        <CardHeader variant="gradient" className="mb-2 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Usuarios <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => { setOpen(true), setEdit(false); }}><UserPlusIcon className="h-6 w-6 me-2" /> Nuevo usuario</Button>
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <div className="my-2 grid grid-cols-6">
            <div className="col-start-5 col-span-2">
              <Input label="Buscar" value={searchTerm}
                onChange={(e) => (setSearchTerm(e.target.value), setCurrentPage(1))} />
            </div>
          </div>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Rol", "Usuario", "Estado", "Nombre", "Apellido", "Celular", "Correo", "Editar"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id="IdBodyTable">
              {currentPag.map((user) => (
                <tr key={user.idUsuario} id={`User${user.idUsuario}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{user.rol}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{user.usuario}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {user.estado === "Activo" ? (
                      <Button onClick={() => {
                        switchEstado(user.idUsuario)
                      }} className="btnGreen text-white font-bold py-2 px-4 rounded-full">
                        Activo
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        switchEstado(user.idUsuario)
                      }} className="btnRed text-white font-bold py-2 px-4 rounded-full">
                        Inactivo
                      </Button>
                    )}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{user.nombre}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{user.apellido}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{formatNumCel(user.celular.toString())}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{user.correo}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button onClick={() => { Edit(user) }}
                      className="text-xs font-semibold btnFunciones btnOrange"><PencilSquareIcon /></Button>
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
export default Usuarios;