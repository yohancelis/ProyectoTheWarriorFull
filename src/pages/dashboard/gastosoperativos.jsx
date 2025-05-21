import React, { Fragment, useState, useEffect } from "react";
import {
  Typography, Card, CardHeader, CardBody, Input, Button
} from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';

export function GastosOperativos() {
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
  //se crean las listas en las que se van a guardar datos de las apis
  const [gastosoperativosList, setGastosOperativosL] = useState([]);
  const [conceptogastoList, setConceptoGastoL] = useState([]);

  //se crean variables en las que se guardan los datos de los input
  const [conceptogasto, setConceptoGasto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechagasto, setFechaGasto] = useState("");
  const [totalgasto, setTotalGasto] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorConceptogasto, setErrorConceptoGasto] = useState(false);
  const [errorFechagasto, setErrorFechaGasto] = useState(false);
  const [errorTotalgasto, setErrorTotalGasto] = useState(false);

  const [selectConcepto, setSelectConcepto] = useState(null);
  const conceptoOptions = conceptogastoList.map(serv => ({ value: serv.IdConceptoGasto, label: serv.NombreDelGasto }));

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const URLGastosOp = "http://localhost:8080/api/gastosoperativos";
  const URLConceptoGasto = "http://localhost:8080/api/conceptogasto";

  const getGastosOperativo = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLGastosOp);
      setGastosOperativosL(resp.data.gastosoperativos);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos: ", error);
    }
  };

  const getConceptoGasto = async () => {
    try {
      const resp = await Axios.get(URLConceptoGasto);
      const conceptogastoData = resp.data.conceptogasto.reduce((acc, conceptogasto) => {
        acc[conceptogasto.IdConceptoGasto] = conceptogasto;
        return acc;
      }, []);
      setConceptoGastoL(conceptogastoData);
    } catch (error) {
      showAlert("error", "Error al obtener el concepto de gasto", error);
    }
  };
  //se inicializa los metodos o endpoints get para que cargue la informacion
  useEffect(() => {
    getGastosOperativo();
    getConceptoGasto();
  }, []);

  //funcion para vaciar las variables
  const empty = () => {
    setOpen(false);
    setEdit(false);
    setErrorAll(false);
    setErrorConceptoGasto(false);
    setErrorFechaGasto(false);
    setErrorTotalGasto(false);
    setId("");
    setConceptoGasto("");
    setDescripcion("");
    setFechaGasto("");
    setTotalGasto("");
    setSelectConcepto(null);
    setLoading(false);
    getGastosOperativo();
  };

  const postGastosOperativos = async () => {
    setErrorAll(false);
    setErrorConceptoGasto(false);
    setErrorFechaGasto(false);
    setErrorTotalGasto(false);
    if (!conceptogasto && !fechagasto && !totalgasto) {
      setErrorAll(true);
      return showAlert("error", "Complete los campos primero.");
    } else if (!conceptogasto) {
      setErrorConceptoGasto(true);
      return showAlert("error", "El campo gastos operativos no puede estar vacío.");
    } else if (!fechagasto) {
      setErrorFechaGasto(true);
      return showAlert("error", "El campo fecha no puede estar vacío.");
    } else if (!totalgasto) {
      setErrorTotalGasto(true);
      return showAlert("error", "El campo total del gasto no puede estar vacío.");
    } else {
      showAlert("info", "Registrando gasto operativo...");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLGastosOp, {
        IdConceptoGasto: conceptogasto,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        FechaDelGasto: fechagasto,
        TotalDelGasto: totalgasto,
      }).then(() => {
        setTimeout(async () => {
          empty();
          showAlert("success", "Gasto operativo registrado con éxito.");
        }, 500);
      }).catch((error) => {
        showAlert("error", "error al registar Fun gasto operativo.");
        console.error("Error al registrar el gasto operativo:", error);
      });
    }
  }

  const putGastosOperativos = async () => {
    setErrorAll(false);
    setErrorConceptoGasto(false);
    setErrorFechaGasto(false);
    setErrorTotalGasto(false);
    if (!conceptogasto && !fechagasto && !totalgasto) {
      setErrorAll(true);
      return showAlert("error", "Complete los campos primero.");
    } else if (!conceptogasto) {
      setErrorConceptoGasto(true);
      return showAlert("error", "El campo gastos operativos no puede estar vacío.");
    } else if (!fechagasto) {
      setErrorFechaGasto(true);
      return showAlert("error", "El campo fecha no puede estar vacío.");
    } else if (!totalgasto) {
      setErrorTotalGasto(true);
      return showAlert("error", "El campo total del gasto no puede estar vacío.");
    } else {
      showAlert("info", "Actualizando gasto operativo...");
      setOpen(false)
      setLoading(true);
      await Axios.put(URLGastosOp, {
        IdGastosOperativo: id,
        IdConceptoGasto: conceptogasto,
        Descripcion: descripcion ? descripcion : "Sin descripción.",
        FechaDelGasto: fechagasto,
        TotalDelGasto: totalgasto,
      }).then(() => {
        setTimeout(async () => {
          empty();
          showAlert("success", "Gasto operativo actualizado con éxito.");
        }, 500);
      }).catch((error) => {
        showAlert("error", "error al registar un gasto operativo");
        console.error("Error al registrar el gasto operativo:", error);
      });
    }
  }

  const Edit = (val) => {
    setOpen(true);
    setEdit(true);
    setErrorAll(false);
    setErrorConceptoGasto(false);
    setErrorFechaGasto(false);
    setErrorTotalGasto(false);
    setSelectConcepto({ value: val.IdConceptoGasto, label: conceptogastoList.filter(c => c.IdConceptoGasto === val.IdConceptoGasto).map(c => c.NombreDelGasto) });
    setId(val.IdGastosOperativo);
    setConceptoGasto(val.IdConceptoGasto);
    setDescripcion(val.Descripcion);
    setFechaGasto(val.FechaDelGasto);
    setTotalGasto(val.TotalDelGasto);
  };

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [gastosList, setGastosList] = useState([]);

  useEffect(() => {
    if (conceptogastoList.length > 0 && gastosoperativosList.length > 0) {
      listaGastos();
    }
  }, [conceptogastoList, gastosoperativosList]);

  const listaGastos = () => {
    const gasto = gastosoperativosList.map(con => {
      const concepto = conceptogastoList.find(gas => gas && con && gas.IdConceptoGasto === con.IdConceptoGasto);
      return {
        IdConceptoGasto: con.IdConceptoGasto,
        IdGastosOperativo: con.IdGastosOperativo,
        NombreDelGasto: concepto.NombreDelGasto,
        Descripcion: concepto.Descripcion,
        FechaDelGasto: con.FechaDelGasto,
        TotalDelGasto: con.TotalDelGasto,
      }
    })
    setGastosList(gasto);
  }

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar valores según el término de búsqueda
  const filteredElements = gastosList.filter((user) => {
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
                <div className="mt-12 mb-8 flex flex-col gap-12">
                  <Card className="formRegUsu max-w-lg">
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white">
                        {edit ? ("Editar Gastos operativos") : ("Crear Gasto operativo")}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-0 pt-0 pl-2 pr-2 pb-2">
                      <div className="gap-3">
                        {edit ? (
                          <div className={`${errorAll || errorConceptogasto ? "divError" : ""} mt-3`}>
                            <Select
                              className={`${errorAll || errorConceptogasto ? "error" : ""} text-gray-600`}
                              placeholder="Seleccione un concepto"
                              isSearchable
                              value={selectConcepto}
                              options={conceptoOptions}
                              onChange={(selConcepto) => {
                                setSelectConcepto(selConcepto);
                                setConceptoGasto(selConcepto.value);
                              }} />
                          </div>
                        ) : (
                          <div className={`${errorAll || errorConceptogasto ? "divError" : ""} mt-3`}>
                            <Select
                              className={`${errorAll || errorConceptogasto ? "error" : ""} text-gray-600`}
                              placeholder="Seleccione un concepto"
                              isSearchable
                              value={selectConcepto}
                              options={conceptoOptions}
                              onChange={(selConcepto) => {
                                setSelectConcepto(selConcepto);
                                setConceptoGasto(selConcepto.value);
                                const valorGasto = conceptogastoList.filter(con => con.IdConceptoGasto === selConcepto.value).map(con => con.ValorDelGasto)
                                setTotalGasto(valorGasto)
                              }} />
                          </div>
                        )}
                        <div className={`mt-3`}>
                          <Input
                            className={`text-gray-600`}
                            label="Descripción (Opcional)"
                            value={descripcion}
                            onChange={(event) => setDescripcion(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorFechagasto ? "divError" : ""} mt-3`}>
                          <Input
                            className={`${errorAll || errorFechagasto ? "error errorEmpty" : ""} text-gray-600`}
                            label="Fecha"
                            value={fechagasto}
                            type="date"
                            onChange={(event) => setFechaGasto(event.target.value)} />
                        </div>
                        <div className={`${errorAll || errorTotalgasto ? "divError" : ""} mt-3`}>
                          <Input
                            className={`${errorAll || errorTotalgasto ? "error" : ""} text-gray-600`}
                            label="TotalDelGasto"
                            value={totalgasto}
                            onChange={(event) => setTotalGasto(event.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-center items-center mt-3">
                        {edit ? (
                          <div>
                            <Button onClick={() => { putGastosOperativos() }}
                              className="btnOrange text-white font-bold py-2 px-4 rounded">
                              Editar Gasto
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => { postGastosOperativos() }}
                            className="btnGreen text-white font-bold py-2 px-4 rounded">
                            Crear Gasto
                          </Button>
                        )}
                        <Button onClick={(e) => {
                          setLoading(true);
                          setOpen(false);
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
            Gastos Operativos <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => { setOpen(true), setEdit(false); }}><PencilSquareIcon className="h-6 w-6 text-gray-200 me-2" />Nuevo Gasto</Button>
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
                {["Gastos Operativo", "Descripción", "Fecha Gasto", "Total Del Gasto", "Editar"].map((el) => (
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
              {currentPag.map((gastosop) => (
                <tr key={gastosop.IdGastosOperativo} id={`${gastosop.IdGastosOperativo}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{gastosop.NombreDelGasto}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{gastosop.Descripcion}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{gastosop.FechaDelGasto}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">${formatNumber(gastosop.TotalDelGasto.toString())}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => { Edit(gastosop) }}
                      className="text-xs font-semibold btnFunciones btnOrange"><PencilSquareIcon />
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
}
export default GastosOperativos;