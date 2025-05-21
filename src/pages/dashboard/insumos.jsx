import React, { Fragment, useRef, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button, } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import Swal from "sweetalert2";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";


export function Insumos() {
  function showAlert(icon = "success", title) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: icon,
      title: title,
    });
  }

  const [productosList, setProductosList] = useState([]);

  const [nombreProducto, setNombreProducto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidadDisponible, setCantidadDisponible] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorDescripcion, setErrorDescripcion] = useState(false);
  const [errorCantidad, setErrorCantidad] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState(false);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const URLProductos = "http://localhost:8080/api/gestionproductos";

  const getProductos = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLProductos);
      setProductosList(resp.data.gestionproductos);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos: ", error);
    }
  };

  useEffect(() => {
    getProductos();
  }, []);

  const postProducto = async () => {
    setErrorAll(false);
    setErrorNombre(false);
    setErrorDescripcion(false);
    setErrorCantidad(false);
    setErrorPrecio(false);
    if (!nombreProducto && !descripcion && !cantidadDisponible && !precioUnitario) {
      setErrorAll(true);
      return showAlert("error", "Complete el formulario primero.");
    } else if (!nombreProducto) {
      setErrorNombre(true);
      return showAlert("error", "Ingrese el nombre del insumo.");
    } else if (!cantidadDisponible) {
      setErrorCantidad(true);
      return showAlert("error", "Ingrese la cantidad disponible.");
    } else if (!precioUnitario) {
      setErrorPrecio(true);
      return showAlert("error", "Ingrese el valor unitario.");
    } else {
      if (!descripcion) {
        setDescripcion("Sin descripción.");
      }
      showAlert("info", "Registrando insumo...");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLProductos, {
        NombreProducto: nombreProducto,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        CantidadDisponible: cantidadDisponible,
        PrecioUnitario: precioUnitario,
      }).then(() => {
        showAlert("success", "Insumo registrado con éxito...");
        setTimeout(() => {
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al registrar el insumo");
        console.error("Error al registrar el insumo:", error);
      });
    }
  };

  const putProducto = async () => {
    if (!nombreProducto) {
      showAlert("error", "El campo del nombre de insumo no puede estar vacío.");
    } else {
      showAlert("info", "Actualizando insumo...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLProductos, {
        IdProducto: id,
        NombreProducto: nombreProducto,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        CantidadDisponible: cantidadDisponible,
        PrecioUnitario: precioUnitario,
      }).then(() => {
        showAlert("success", "Insumo actualizado con éxito...");
        setTimeout(() => {
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al actualizar el insumo");
        console.error("Error al actualizar el insumo:", error);
      });
    }
  };

  const Reg = () => {
    setEdit(false);
    setOpen(true);
    setErrorAll(false);
    setErrorNombre(false);
    setErrorDescripcion(false);
    setErrorCantidad(false);
    setErrorPrecio(false);
  };

  const Edit = (val) => {
    setEdit(true);
    setOpen(true);
    setErrorAll(false);
    setErrorNombre(false);
    setErrorDescripcion(false);
    setErrorCantidad(false);
    setErrorPrecio(false);
    setId(val.IdProducto);
    setNombreProducto(val.NombreProducto);
    setDescripcion(val.Descripcion);
    setCantidadDisponible(val.CantidadDisponible);
    setPrecioUnitario(val.PrecioUnitario);
  };

  const empty = () => {
    setOpen(false);
    setEdit(false);
    setErrorAll(false);
    setErrorNombre(false);
    setErrorDescripcion(false);
    setErrorCantidad(false);
    setErrorPrecio(false);
    setNombreProducto("");
    setDescripcion("");
    setCantidadDisponible("");
    setPrecioUnitario("");
    setLoading(false);
    getProductos();
  };

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = productosList.filter((user) => {
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
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-2 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Insumos
            <Button
              className="btnRed px-3 py-2 flex items-center border"
              onClick={() => Reg()}>
              <PencilSquareIcon className="h-6 w-6 me-2" /> Nuevo Insumo
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
                {["Nombre Insumo", "Descripción", "Cantidad Disponible", "Precio Unitario", "Editar"].map((el) => (
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
              {currentPag.map((insumo) => (
                <tr key={insumo.IdProducto}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {insumo.NombreProducto}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {insumo.Descripcion}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {insumo.CantidadDisponible}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    ${formatNumber(insumo.PrecioUnitario)}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => {
                        Edit(insumo);
                      }}
                      className="btnFunciones btnOrange text-xs font-semibold text-blue-gray-600 h-6 w-6">
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
                  <Card className="formRegServ">
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white">
                        {edit ? "Editar Insumo" : "Nuevo Insumo"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`${errorAll || errorNombre ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorNombre ? "error" : ""}`}
                            label="Nombre del Insumo"
                            value={nombreProducto}
                            onChange={(event) => setNombreProducto(event.target.value)} />
                        </div>
                        <div className={`col-span-1`}>
                          <Input
                            label="Descripción (opcional)"
                            value={descripcion}
                            onChange={(event) => setDescripcion(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorCantidad ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorCantidad ? "error" : ""}`}
                            label="Cantidad"
                            type="number"
                            value={cantidadDisponible}
                            onChange={(event) => setCantidadDisponible(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorPrecio ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorPrecio ? "error" : ""}`}
                            label="Valor"
                            type="number"
                            value={precioUnitario}
                            onChange={(event) => setPrecioUnitario(event.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mx-3 mt-3 mb-1">
                        {edit ? (
                          <div>
                            <Button
                              onClick={() => {
                                putProducto();
                              }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded">
                              Editar Insumo
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              postProducto();
                            }}
                            className="btnGreen text-white font-bold py-2 px-4 rounded">
                            Crear Insumo
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setOpen(false)
                            setLoading(true)
                            setTimeout(() => {
                              empty()
                            }, 500);
                          }}
                          className="btnRed text-white font-bold py-2 px-4 rounded ms-5">
                          Cancelar
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog >
      </Transition.Root >
    </div >
  );
}

export default Insumos;