import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, } from 'react-router-dom';
import { Typography, Card, CardHeader, CardBody, Input, Button } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import { PencilSquareIcon, ScissorsIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export function Servicios() {

  //funcion para las alertas
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
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  }

  const navigate = useNavigate();

  const [serviciosList, setServicios] = useState([]);

  const [nomServicio, setNomServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorNomServicio, setErrorNomServicio] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState(false);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const empty = () => {
    setOpen(false);
    setEdit(false);
    setErrorAll(false)
    setErrorNomServicio(false)
    setErrorPrecio(false)
    setNomServicio("");
    setDescripcion("");
    setPrecio("");
    setLoading(false);
    getServicios();
  };

  const URLServicios = "http://localhost:8080/api/servicios";

  const getServicios = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLServicios);
      setServicios(resp.data.servicios);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de la agenda: ", error);
    }
  };

  useEffect(() => {
    getServicios();
  }, []);

  const postServicio = async () => {
    setErrorAll(false)
    setErrorNomServicio(false)
    setErrorPrecio(false)
    if (!nomServicio && !precio) {
      setErrorAll(true)
      return showAlert("error", "Complete el formulario primero.");
    } else if (!nomServicio) {
      setErrorNomServicio(true)
      return showAlert("error", "El campo del nombre de servicio no puede estar vacío.");
    } else if (serviciosList.map((servicio) => servicio.NombreDelServicio.toLowerCase()).includes(nomServicio.toLowerCase())) {
      setErrorNomServicio(true)
      return showAlert("error", "Ese servicio ya está registrado...");
    } else if (!precio) {
      setErrorPrecio(true)
      return showAlert("error", "El campo del precio no puede estar vacío.");
    } else {
      showAlert("info", "Registrando servicio...");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLServicios, {
        NombreDelServicio: nomServicio,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        Precio: precio
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Servicio registrado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al registrar el servicio");
        console.error("Error al registrar el servicio:", error);
      });
    }
  };

  const Edit = (val) => {
    setOpen(true);
    setEdit(true);
    setId(val.IdServicio);
    setNomServicio(val.NombreDelServicio);
    setDescripcion(val.Descripcion);
    setPrecio(val.Precio);
  };

  const putServicio = async () => {
    setErrorAll(false)
    setErrorNomServicio(false)
    setErrorPrecio(false)
    if (!nomServicio && !precio) {
      setErrorAll(true)
      return showAlert("error", "Complete el formulario primero.");
    } else if (!nomServicio) {
      setErrorNomServicio(true)
      return showAlert("error", "El campo del nombre de servicio no puede estar vacío.");
    } else if (serviciosList.map((servicio) => servicio.NombreDelServicio.toLowerCase()).includes(nomServicio.toLowerCase()) && id !== serviciosList.find(s => s.IdServicio === id).IdServicio) {
      setErrorNomServicio(true)
      return showAlert("error", "Ese servicio ya está registrado...");
    } else if (!precio) {
      setErrorPrecio(true)
      return showAlert("error", "El campo del precio no puede estar vacío.");
    } else {
      showAlert("info", "Actualizando servicio...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLServicios, {
        IdServicio: id,
        NombreDelServicio: nomServicio,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        Precio: precio
      }).then(() => {
        setTimeout(() => {
          showAlert("success", "Servicio actualizado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "Error al actualizar el servicio");
        console.error("Error al actualizar el servicio:", error);
      });
    }
  };

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = serviciosList.filter((user) => {
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
                        {edit ? ("Editar Servicio") : ("Nuevo servicio")}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`${errorAll || errorNomServicio ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorNomServicio ? "error" : ""}`}
                            label="Nombre para el servicio"
                            value={nomServicio}
                            onChange={(event) => setNomServicio(event.target.value)} />
                        </div>
                        <div className={`col-span-1`}>
                          <Input
                            label="Descripción (Opcional)"
                            value={descripcion}
                            onChange={(event) => setDescripcion(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorPrecio ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorPrecio ? "error" : ""}`}
                            label="Precio"
                            type="number"
                            value={precio}
                            onChange={(event) => setPrecio(event.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mx-3 mt-3 mb-1">
                        {edit ? (
                          <div>
                            <Button onClick={() => { putServicio() }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded">
                              Editar servicio
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => { postServicio() }}
                            className="btnGreen text-white font-bold py-2 px-4 rounded">
                            Crear servicio
                          </Button>
                        )}
                        <Button onClick={(e) => {
                          setOpen(false)
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
            <p>Servicios</p>
            <Button className="btnRed px-3 py-2 flex items-center border ms-3"
              onClick={() => { setOpen(true), setEdit(false); }}>
              <ScissorsIcon className="h-6 w-6 me-2" /> Nuevo servicio
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
                {["Nombre del servicio", "Descripción", "Precio", "Editar"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left" >
                    <Typography
                      variant="small"
                      className="text-[13px] font-bold uppercase text-blue-gray-400" >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id="IdBodyTable">
              {currentPag.map((servicio) => (
                <tr key={servicio.IdServicio} id={`User${servicio.IdServicio}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{servicio.NombreDelServicio}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{servicio.Descripcion}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{formatNumber(`$${servicio.Precio}`)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => { Edit(servicio) }}
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

    </div >
  );
}
export default Servicios;