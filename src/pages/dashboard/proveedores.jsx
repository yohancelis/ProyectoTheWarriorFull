import React, { Fragment, useState, useEffect } from "react";
import {
  Typography, Card, CardHeader, CardBody, IconButton,
  Menu, MenuHandler, MenuList, MenuItem, Avatar,
  Tooltip, Progress, Input, Button
} from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import {
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { UsersIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";


export function Proveedores() {

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

  const [proveedoresList, setProveedoresList] = useState([]);

  const [nombreProveedor, setNombreProveedor] = useState("");
  const [nombreContacto, setNombreContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorNombreProveedor, setErrorNombreProveedor] = useState(false);
  const [errorNombreContacto, setErrorNombreContacto] = useState(false);
  const [errorTelefono, setErrorTelefono] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(false);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const URLProveedores = "http://localhost:8080/api/proveedores";

  const getProveedores = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLProveedores);
      setProveedoresList(resp.data.proveedores);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos: ", error);
    }
  };

  useEffect(() => {
    getProveedores();
  }, []);

  const postProveedor = async () => {
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    setErrorAll(false);
    setErrorNombreProveedor(false);
    setErrorNombreContacto(false);
    setErrorTelefono(false);
    setErrorCorreo(false);
    if (!nombreProveedor && !nombreContacto && !telefono && !correo) {
      setErrorAll(true);
      return showAlert("error", "Complete el formulario.");
    } else if (!nombreProveedor) {
      setErrorNombreProveedor(true);
      return showAlert("error", "Ingrese el nombre del proveedor.");
    } else if (!nombreContacto) {
      setErrorNombreContacto(true);
      return showAlert("error", "Ingrese el nombre de contacto.");
    } else if (!telefono) {
      setErrorTelefono(true);
      return showAlert("error", "Ingrese el número de teléfono.");
    } else if (!valCel.test(telefono)) {
      showAlert("error", "Ingrese un número de teléfono válido.");
      setErrorTelefono(true);
    } else if (!correo) {
      setErrorCorreo(true);
      return showAlert("error", "Ingrese el correo.");
    } else if (!valEm.test(correo)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else {
      showAlert("info", "Registrando proveedor...");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLProveedores, {
        NombreProveedor: nombreProveedor,
        NombreContacto: nombreContacto,
        Telefono: telefono,
        Correo: correo
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Proveedor registrado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al registrar el proveedor");
        console.error("Error al registrar el proveedor:", error);
      });
    }
  };

  const putProveedor = async () => {
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    setErrorAll(false);
    setErrorNombreProveedor(false);
    setErrorNombreContacto(false);
    setErrorTelefono(false);
    setErrorCorreo(false);
    if (!nombreProveedor && !nombreContacto && !telefono && !correo) {
      setErrorAll(true);
      return showAlert("error", "Complete el formulario.");
    } else if (!nombreProveedor) {
      setErrorNombreProveedor(true);
      return showAlert("error", "Ingrese el nombre del proveedor.");
    } else if (!nombreContacto) {
      setErrorNombreContacto(true);
      return showAlert("error", "Ingrese el nombre del contacto.");
    } else if (!telefono) {
      setErrorTelefono(true);
      return showAlert("error", "Ingrese el número de teléfono.");
    } else if (!valCel.test(telefono)) {
      showAlert("error", "Ingrese un número de teléfono válido.");
      setErrorTelefono(true);
    } else if (!correo) {
      setErrorCorreo(true);
      return showAlert("error", "Ingrese el correo.");
    } else if (!valEm.test(correo)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else {
      showAlert("info", "Actualizando proveedor...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLProveedores, {
        IdProveedor: id,
        NombreProveedor: nombreProveedor,
        NombreContacto: nombreContacto,
        Telefono: telefono,
        Correo: correo
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Proveedor actualizado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al actualizar el proveedor");
        console.error("Error al actualizar el proveedor:", error);
      });
    }
  };

  const Edit = (val) => {
    setEdit(true);
    setOpen(true);
    setId(val.IdProveedor);
    setNombreProveedor(val.NombreProveedor);
    setNombreContacto(val.NombreContacto);
    setTelefono(val.Telefono);
    setCorreo(val.Correo);
  };

  const empty = () => {
    setOpen(false);
    setErrorAll(false);
    setErrorNombreProveedor(false);
    setErrorNombreContacto(false);
    setErrorTelefono(false);
    setErrorCorreo(false);
    setNombreProveedor("");
    setNombreContacto("");
    setTelefono("");
    setCorreo("");
    setEdit(false);
    setLoading(false);
    getProveedores();
  };

  function formatNumCel(number) {
    const fstSegment = number.substring(0, 3);
    const sndSegment = number.substring(3, 6);
    const trdSegment = number.substring(6, 10);
    const formatCel = `(${fstSegment}) ${sndSegment}-${trdSegment}`;
    return formatCel;
  }
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = proveedoresList.filter((user) => {
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
                  <Card className="formRegServ">
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white">
                        {edit ? "Editar Proveedor" : "Nuevo Proveedor"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`${errorAll || errorNombreProveedor ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorNombreProveedor ? "error" : ""}`}
                            label="Nombre del Proveedor"
                            value={nombreProveedor}
                            onChange={(event) => setNombreProveedor(event.target.value)}
                          />
                        </div>
                        <div className={`${errorAll || errorNombreContacto ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorNombreContacto ? "error" : ""}`}
                            label="Nombre del Contacto"
                            value={nombreContacto}
                            onChange={(event) => setNombreContacto(event.target.value)}
                          />
                        </div>
                        <div className={`${errorAll || errorTelefono || telefono.length > 10 ? "divError" : ""} relative flex items-center col-span-1`}>
                          <Input
                            className={`${errorAll || errorTelefono || telefono.length > 10 ? "error" : ""} pe-14`}
                            label="Teléfono"
                            type="number"
                            value={telefono}
                            onChange={(event) => setTelefono(event.target.value)}
                          />
                          <span className={`${errorAll || errorTelefono || telefono.length > 10 ? "error" : ""} absolute right-3`}>{telefono.length}/10</span>
                        </div>
                        <div className={`${errorAll || errorCorreo ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorCorreo ? "error" : ""}`}
                            label="Correo"
                            value={correo}
                            onChange={(event) => setCorreo(event.target.value)}
                            type="email"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mx-3 mt-3 mb-1">
                        {edit ? (
                          <div>
                            <Button
                              onClick={() => {
                                putProveedor();
                              }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded" >
                              Editar Proveedor
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              postProveedor();
                            }}
                            className="btnGreen text-white font-bold py-2 px-4 rounded" >
                            Crear Proveedor
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            setOpen(false);
                            setLoading(true)
                            setTimeout(() => {
                              empty();
                            }, 500);
                          }}
                          className="btnRed text-white font-bold py-2 px-4 rounded ms-5" >
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
            Proveedores{" "}
            <Button
              className="btnRed px-3 py-2 flex items-center border"
              onClick={() => {
                setEdit(false);
                setOpen(true);
              }}>
              <UsersIcon className="h-6 w-6 me-2" /> Nuevo Proveedor
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
                {["Nombre Proveedor", "Nombre Contacto", "Teléfono", "Correo", "Editar"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id="IdBodyTable">
              {currentPag.map((proveedor) => (
                <tr key={proveedor.IdProveedor}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {proveedor.NombreProveedor}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {proveedor.NombreContacto}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {formatNumCel(proveedor.Telefono.toString())}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {proveedor.Correo}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => {
                        Edit(proveedor);
                      }}
                      className="btnFunciones btnOrange text-xs font-semibold text-blue-gray-600 h-6 w-6"
                    >
                      <PencilSquareIcon />
                    </Button>
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
};

export default Proveedores;