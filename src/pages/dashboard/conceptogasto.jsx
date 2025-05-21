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
  TrashIcon, ScissorsIcon
} from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { number } from "prop-types";

export function GestionConceptoGasto() {
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
  // se crea la lista donde se van a guardar los datos de las api
  const [conceptogastoList, setConceptoGL] = useState([]);
  // se crean las variables que van a guardar los datos
  const [nombreg, setNombreG] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valordelg, setValordelg] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorNombreg, setErrorNombreG] = useState(false);
  const [errorValordelg, setErrorValordelg] = useState(false);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // Definir  la url de conceptoGasto
  const URLConceptoGasto = "http://localhost:8080/api/conceptogasto";

  // creamos la funcion asincrona
  // creamos la funcion asincrona
  const getConceptoG = async () => {
    try {
      setLoading(true);
      const respues = await Axios.get(URLConceptoGasto);
      setConceptoGL(respues.data.conceptogasto);
      setLoading(false);
    } catch (error) {
      console.error(" Error al obtener los datos de concepto de gasto", error);
    }
  };

  //se inicializa los metodos o endpoints get para que cargue la informacion
  useEffect(() => {
    getConceptoG();
  }, []);

  const postConceptoG = async () => {
    setErrorAll(false);
    setErrorNombreG(false);
    setErrorValordelg(false);
    if (!nombreg && !valordelg) {
      setErrorAll(true);
      return showAlert("error", "Complete los campos.");
    } else if (!nombreg) {
      setErrorNombreG(true);
      return showAlert("error", "El campo de nombre no puede estar vacío.");
    } else if (!valordelg) {
      setErrorValordelg(true);
      return showAlert("error", "El campo del valor del gasto no puede estar vacío.");
    } else {
      showAlert("info", "Registrando concepto de gasto...");
      setLoading(true)
      setOpen(false)
      await Axios.post(URLConceptoGasto, {
        NombreDelGasto: nombreg,
        Descripcion: descripcion ? (descripcion) : ("Sin descripción."),
        ValorDelGasto: valordelg,
      }).then(() => {
        setTimeout(async () => {
          empty();
          showAlert("success", "Concepto de gasto registrado con éxito.");
        }, 500);
      }).catch((error) => {
        showAlert("error", "error al registrar el concepto de gasto");
        console.error("Error al registrar el concepto de gasto:", error);
      });
    }
  };

  const Edit = (val) => {
    setEdit(true);
    setOpen(true);
    setErrorAll(false);
    setErrorNombreG(false);
    setErrorValordelg(false);
    setId(val.IdConceptoGasto);
    setNombreG(val.NombreDelGasto);
    setDescripcion(val.Descripcion);
    setValordelg(val.ValorDelGasto);
  };

  const PutConceptoG = async () => {
    setErrorAll(false);
    setErrorNombreG(false);
    setErrorValordelg(false);
    if (!nombreg && !valordelg) {
      setErrorAll(true);
      return showAlert("error", "Complete los campos.");
    } else if (!nombreg) {
      setErrorNombreG(true);
      return showAlert("error", "El campo de nombre no puede estar vacío.");
    } else if (!valordelg) {
      setErrorValordelg(true);
      return showAlert("error", "El campo del valor del gasto no puede estar vacío.");
    } else if (valordelg == 0) {
      setErrorValordelg(true);
      return showAlert("error", "El campo del valor del gasto no puede ser 0.");
    } else {
      showAlert("success", "Actualizando concepto de gasto...");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLConceptoGasto, {
        IdConceptoGasto: id,
        NombreDelGasto: nombreg,
        Descripcion: descripcion ? (descripcion) : ("Sin descripción."),
        ValorDelGasto: valordelg,
      }).then(() => {
        setTimeout(async () => {
          empty();
          showAlert("success", "Concepto de gasto actualizado con éxito.");
        }, 500);
      })
        //en caso de error se muestra en la consola
        .catch((error) => {
          showAlert("error", "Error al actualizar el concepto de gasto");
          console.error("Error al actualizar el concepto de gasto:", error);
        });
    }
  }

  //funcion para vaciar las variables
  const empty = () => {
    setEdit(false);
    setOpen(false);
    setErrorAll(false);
    setErrorNombreG(false);
    setErrorValordelg(false);
    setNombreG("");
    setDescripcion("");
    setValordelg("");
    setLoading(false);
    getConceptoG();
  };

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = conceptogastoList.filter((user) => {
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
                        {edit ? ("Editar Concepto gasto") : ("Nuevo Concepto Gasto")}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`${errorAll || errorNombreg ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorNombreg ? "error" : ""}`}
                            label="Nombre del gasto"
                            value={nombreg}
                            onChange={(event) => setNombreG(event.target.value)} />
                        </div>
                        <div className={`col-span-1`}>
                          <Input
                            label="Descripcion (Opcional)"
                            value={descripcion}
                            onChange={(event) => setDescripcion(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorValordelg ? "divError" : ""} col-span-1`}>
                          <Input
                            className={`${errorAll || errorValordelg ? "error" : ""}`}
                            label="ValorDelGasto"
                            type="number"
                            value={valordelg}
                            onChange={(event) => setValordelg(event.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mx-3 mt-3 mb-1">
                        {edit ? (
                          <div>
                            <Button onClick={() => { PutConceptoG() }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded">
                              Editar Concepto Gasto
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => { postConceptoG() }}
                            className="btnGreen text-white font-bold py-2 px-4 rounded">
                            Crear Concepto gasto
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
            Concepto Gasto <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => { setOpen(true), setEdit(false); }}><PencilSquareIcon className="h-6 w-6 text-gray-200" /> Nuevo Concepto Gasto</Button>
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
                {["NombreDelGasto", "ValorDelGasto", "Descripcion", "Editar"].map((el) => (
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
              {currentPag.map((conceptogasto) => (
                <tr key={conceptogasto.IdConceptoGasto} id={`User${conceptogasto.IdConceptoGasto}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{conceptogasto.NombreDelGasto}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{formatNumber(`$${conceptogasto.ValorDelGasto}`)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{conceptogasto.Descripcion}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => { Edit(conceptogasto), setOpen(true); }}
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
export default GestionConceptoGasto;