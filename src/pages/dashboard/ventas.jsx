import React, { Fragment, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Button, Input, CardFooter } from "@material-tailwind/react";
import Axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate, } from 'react-router-dom';
import { ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function Ventas() {
  const navigate = useNavigate();

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

  // Estados y métodos para la gestión de datos
  const [ventasList, setVentasL] = useState([]);
  const [empleadosList, setEmpleadosL] = useState([]);
  const [clientesList, setClientesL] = useState([]);
  const [usuariosList, setUsuariosL] = useState([]);
  const [serviciosList, setServiciosL] = useState([]);
  const [ventasServiciosList, setVentasServiciosL] = useState([]);
  const [nuevaVentasServiciosList, setNuevaVentasServiciosL] = useState([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // URLs de las APIs
  const URLVentas = "http://localhost:8080/api/ventas";
  const URLServicios = "http://localhost:8080/api/servicios";
  const URLVentxServ = "http://localhost:8080/api/ventasxservicios";
  const URLEmpleados = "http://localhost:8080/api/empleados";
  const URLClientes = "http://localhost:8080/api/clientes";
  const URLUsuarios = "http://localhost:8080/api/usuarios";

  // Métodos para obtener datos de la API
  const getEmpleados = async () => {
    try {
      const resp = await Axios.get(URLEmpleados);
      setEmpleadosL(resp.data.empleados);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los empleados");
    }
  };

  const getServicios = async () => {
    try {
      const resp = await Axios.get(URLServicios);
      setServiciosL(resp.data.servicios);
    } catch (error) {
      console.error("Error al obtener datos de los servicios:", error);
    }
  };

  const getUsuarios = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLUsuarios);
      setUsuariosL(resp.data.usuarios);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  const getClientes = async () => {
    try {
      const resp = await Axios.get(URLClientes);
      setClientesL(resp.data.clientes);
    } catch (error) {
      console.error("Error al obtener datos de los clientes:", error);
    }
  };

  const getVentas = async () => {
    try {
      const resp = await Axios.get(URLVentas);
      setVentasL(resp.data.ventas);
    } catch (error) {
      console.error("Error al obtener datos de la venta: ", error);
    }
  };

  const getVentasServicios = async () => {
    try {
      const resp = await Axios.get(URLVentxServ);
      setVentasServiciosL(resp.data.ventasxservicios);
    } catch (error) {
      console.error("Error al obtener datos de la venta: ", error);
    }
  };

  useEffect(() => {
    getClientes();
    getEmpleados();
    getVentas();
    getUsuarios();
    getServicios();
    getVentasServicios();
  }, []);

  useEffect(() => {
    if (ventasList.length > 0 && ventasServiciosList.length > 0) {
      servVent();
    }
  }, [ventasList, ventasServiciosList]);

  const servVent = async () => {
    const aServVent = ventasList.map(v => {
      const ventServ = ventasServiciosList.filter(vs => vs.IdVenta === v.IdVenta).map(vs => vs.ValorServicio);
      const totalValorServicio = ventServ.reduce((total, valor) => total + valor, 0);
      const cli = clientesList.filter(c => c.IdCliente === v.IdCliente).map(c => usuariosList.find(u => u.IdUsuario === c.IdUsuario)?.Usuario);
      const empl = empleadosList.filter(e => e.IdEmpleado === v.IdEmpleado).map(e => usuariosList.find(u => u.IdUsuario === e.IdUsuario)?.Usuario);
      return {
        IdVenta: v.IdVenta,
        CodFactura: v.CodFactura,
        FechaRegistro: v.FechaRegistro,
        Cliente: cli.toString(),
        Empleado: empl.toString(),
        ValorServicio: totalValorServicio
      };
    });
    setNuevaVentasServiciosL(aServVent);
  };

  const agruparVentas = () => {
    const ventasAgrupadas = nuevaVentasServiciosList.reduce((acumulador, venta) => {
      const codigoFactura = venta.CodFactura;
      if (!acumulador[codigoFactura]) {
        acumulador[codigoFactura] = {
          IdVenta: venta.IdVenta,
          CodFactura: codigoFactura,
          FechaRegistro: venta.FechaRegistro,
          Cliente: venta.Cliente,
          Empleado: venta.Empleado,
          Total: venta.ValorServicio
        };
      }
      return acumulador;
    }, {});
    return Object.values(ventasAgrupadas);
  };
  const ventasResumidas = agruparVentas();

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [obsList, setObsList] = useState([]);

  const observar = async (id) => {
    const ventaL = ventasList.find(vl => vl.IdVenta === id);
    const emplUser = usuariosList.find(u => u.IdUsuario === empleadosList.find(e => e.IdEmpleado === ventaL.IdEmpleado)?.IdUsuario)?.Usuario;
    const cliUser = usuariosList.find(u => u.IdUsuario === clientesList.find(c => c.IdCliente === ventaL.IdCliente)?.IdUsuario)?.Usuario;
    const ObsVenta = ventasServiciosList.filter(vsl => vsl.IdVenta === id).map(vsl => {
      const serv = serviciosList.find(s => s.IdServicio === vsl.IdServicio)?.NombreDelServicio
      return {
        IdVenta: id,
        CodFactura: ventaL.CodFactura,
        Empleado: emplUser,
        Cliente: cliUser,
        Fecha: ventaL.FechaRegistro,
        Servicio: serv,
        Valor: vsl.ValorServicio
      }
    })
    setObsList(ObsVenta);
    setOpen(true);
  }

  const [searchTerm, setSearchTerm] = useState("");
  // Estados para el paginado
  const [currentPage, setCurrentPage] = useState(1);
  const [elementos] = useState(5); // Número de elementos por página

  // Filtrar valores según el término de búsqueda
  const filteredElements = ventasResumidas.filter((user) => {
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

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Reporte de Ventas", 14, 16);
    doc.setFontSize(12);

    const tableColumn = ["CodFactura", "Fecha de Registro", "Precio Total"];
    const tableRows = [];

    ventasResumidas.forEach(venta => {
      const ventaData = [
        venta.CodFactura,
        venta.FechaRegistro,
        `$${formatNumber(venta.Total)}`
      ];
      tableRows.push(ventaData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      headStyles: { fillColor: [180, 0, 0] }
    });

    doc.save(`Reporte_Ventas_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Card>
        <CardHeader variant="gradient" className="mb-2 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Ventas <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => navigate('../gestion_ventas')}><ShoppingBagIcon className="h-6 w-6 me-2" /> Nueva Venta</Button>
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <div className="my-2 flex items-center justify-end">
            <Button className="btnRed flex justify-center items-center w-16 h-[40px] p-0 me-4" onClick={generatePDF}>
              <FontAwesomeIcon icon={faFilePdf} className="w-6 h-6" />
            </Button>
            <div className="min-w-[493px]">
              <Input label="Buscar" value={searchTerm}
                onChange={(e) => (setSearchTerm(e.target.value), setCurrentPage(1))} />
            </div>
          </div>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Factura", "Fecha de Registro", "Precio Total", "Observar"].map((el) => (
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
            <tbody>
              {currentPag.map((venta) => (
                <tr key={venta.CodFactura}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{venta.CodFactura}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{venta.FechaRegistro}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">${formatNumber(venta.Total)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button className="btnFunciones btnGray me-3" onClick={() => observar(venta.IdVenta)}>
                      <EyeIcon />
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
                        Código de factura número {obsList.find(obs => obs.CodFactura)?.CodFactura || ''}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-3">
                        <div className="border-l-[1px] border-t-[1px] border-b-[1px] border-collapse border-blue-gray-100">
                          <strong>Cliente</strong><br />
                          <span>{obsList.find(obs => obs.Cliente)?.Cliente}</span>
                        </div>
                        <div className="border-[1px] border-collapse border-blue-gray-100">
                          <strong>Empleado</strong><br />
                          <span>{obsList.find(obs => obs.Empleado)?.Empleado}</span>
                        </div>
                        <div className="border-r-[1px] border-t-[1px] border-b-[1px] border-collapse border-blue-gray-100">
                          <strong>Fecha</strong><br />
                          <span>{obsList.find(obs => obs.Fecha)?.Fecha}</span>
                        </div>
                      </div>
                      <div>
                        <table className="w-full min-w-[640px] table-auto mt-5">
                          <thead>
                            <tr>
                              {["Servicio", "Valor"].map((el) => (
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
                          <tbody id="IdBodyTable" className="text-left">
                            {obsList.map((obs, index) => (
                              <tr key={index} id={`obs${obs.IdVenta}`}>
                                <td className="border-b border-blue-gray-50 py-3 px-5">{obs.Servicio}</td>
                                <td className="border-b border-blue-gray-50 py-3 px-5">${formatNumber(obs.Valor)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                    <CardFooter>
                      <Button className="btnGray" onClick={() => {
                        setLoading(true)
                        setOpen(false)
                        setTimeout(() => {
                          setLoading(false)
                        }, 500);
                      }}>
                        Volver
                      </Button>
                    </CardFooter>
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
export default Ventas;