import React, { Fragment, useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  CardFooter,
} from "@material-tailwind/react";
import Axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate, } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon, TrashIcon, } from "@heroicons/react/24/solid";
import { ShoppingBagIcon, ChevronRightIcon, ChevronLeftIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function Compras() {
  const navigate = useNavigate();

  const [comprasList, setComprasList] = useState([]);
  const [proveedoresList, setProveedoresList] = useState([]);
  const [productosList, setProductosList] = useState([]);
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [total, setTotal] = useState(0);
  const [comprasProductosList, setComprasProductosL] = useState([]);
  const [nuevaComprasProductosList, setnuevaComprasProductosL] = useState([]);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState("");

  const [loading, setLoading] = useState(false);

  const URLCompras = "http://localhost:8080/api/compras";
  const URLProveedores = "http://localhost:8080/api/proveedores";
  const URLGestionProductos = "http://localhost:8080/api/gestionproductos";
  const URLProdComp = "http://localhost:8080/api/detalleProductosCompras";

  const showAlert = (icon = "success", title, timer = 1500) => {
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

  const getCompras = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLCompras);
      setComprasList(resp.data.compras);
      setLoading(false);
    } catch (error) {
      showAlert("Error al obtener los datos de compras: ", error);
    }
  }

  const getComprasProduc = async () => {
    try {
      const resp = await Axios.get(URLProdComp);
      setComprasProductosL(resp.data.detalleProductosCompras);
    } catch (error) {
      showAlert("Error al obtener los datos deL detalle compras insumos: ", error);
    }
  }

  const getProveedores = async () => {
    try {
      const resp = await Axios.get(URLProveedores);
      setProveedoresList(resp.data.proveedores);
    } catch (error) {
      showAlert("Error al obtener los datos de proveedores: ", error);
    }
  }

  const getProductos = async () => {
    try {
      const resp = await Axios.get(URLGestionProductos);
      setProductosList(resp.data.gestionproductos);
    } catch (error) {
      showAlert("Error al obtener los datos de insumos: ", error);
    }
  }

  useEffect(() => {
    getCompras();
    getProveedores();
    getProductos();
    getComprasProduc();
  }, []);

  useEffect(() => {
    if (comprasList.length > 0 && comprasProductosList.length > 0) {
      comProduc();
    }
  }, [comprasList, comprasProductosList]);

  const comProduc = async () => {
    const aComProduc = comprasList.map(c => {
      const comProduc = comprasProductosList.filter(cp => cp.IdCompra === c.IdCompra);
      const totalCantidad = comProduc.reduce((total, cp) => total + cp.Valor * cp.Cantidad, 0);
      const provee = proveedoresList.find(p => p.IdProveedor === c.IdProveedor)?.NombreProveedor;
      return {
        IdCompra: c.IdCompra,
        NumeroFactura: c.NumeroFactura,
        FechaRegistro: c.FechaRegistro,
        Proveedor: provee,
        Total: totalCantidad
      };
    });
    setnuevaComprasProductosL(aComProduc);
  };

  const agruparCompras = () => {
    const ComprasAgrupadas = nuevaComprasProductosList.reduce((acumulador, compra) => {
      const numeroFactura = compra.NumeroFactura;
      if (!acumulador[numeroFactura]) {
        acumulador[numeroFactura] = {
          IdCompra: compra.IdCompra,
          NumeroFactura: numeroFactura,
          FechaRegistro: compra.FechaRegistro,
          Proveedor: compra.Proveedor,
          Total: compra.Total
        };
      }
      return acumulador;
    }, {});
    return Object.values(ComprasAgrupadas);
  };
  const comprasResumidas = agruparCompras();

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const [obsList, setObsList] = useState([]);

  const observar = async (id) => {
    const compraL = comprasList.find(cl => cl.IdCompra === id);
    const ObsCompra = comprasProductosList.filter(cpl => cpl.IdCompra === id).map(cpl => {
      const prov = proveedoresList.find(p => p.IdProveedor === compraL.IdProveedor)?.NombreProveedor;
      const produc = productosList.find(p => p.IdProducto === cpl.IdProducto)?.NombreProducto;
      return {
        IdCompra: id,
        NumeroFactura: compraL.NumeroFactura,
        Proveedor: prov,
        Fecha: compraL.FechaRegistro,
        Cantidad: cpl.Cantidad,
        insumo: produc,
        Valor: cpl.Valor,
      };
    });
    setObsList(ObsCompra);
    setOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [elementos] = useState(5);

  const filteredElements = comprasResumidas.filter((user) => {
    return Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastPag = currentPage * elementos;
  const indexOfFirstPag = indexOfLastPag - elementos;
  const currentPag = filteredElements.slice(indexOfFirstPag, indexOfLastPag);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Reporte de Compras", 14, 16);
    doc.setFontSize(12);

    const tableColumn = ["CodFactura", "Proveedor", "Fecha de Registro", "Precio Total"];
    const tableRows = [];

    comprasResumidas.forEach(compra => {
      const compraData = [
        compra.NumeroFactura,
        compra.Proveedor,
        compra.FechaRegistro,
        `$${formatNumber(compra.Total)}`
      ];
      tableRows.push(compraData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      headStyles: { fillColor: [180, 0, 0] }
    });

    doc.save(`Reporte_Compras_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Card>
        <CardHeader variant="gradient" className="mb-2 p-6 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Compras <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => navigate('../gestion_compras')}><ShoppingBagIcon className="h-6 w-6 me-2" /> Nueva Compra</Button>
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <div className="my-2 flex items-center justify-end">
            <Button className="btnRed flex justify-center items-center w-16 h-[40px] p-0 me-4" onClick={generatePDF}>
              <FontAwesomeIcon icon={faFilePdf} className="w-6 h-6" />
            </Button>
            <div className="w-[493px]">
              <Input label="Buscar" value={searchTerm}
                onChange={(e) => (setSearchTerm(e.target.value), setCurrentPage(1))} />
            </div>
          </div>

          <div className="min-h-[303px]">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["CodFactura", "Proveedor", "Fecha de Registro", "Precio Total", "Observar"].map((el) => (
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
                {currentPag.map((compra) => (
                  <tr key={compra.NumeroFactura} className="align-top border-b border-blue-gray-50">
                    <td className="py-3 px-5">{compra.NumeroFactura}</td>
                    <td className="py-3 px-5">{compra.Proveedor}</td>
                    <td className="py-3 px-5">{compra.FechaRegistro}</td>
                    <td className="py-3 px-5">${formatNumber(compra.Total)}</td>
                    <td className="py-3 px-5">
                      <Button className="btnFunciones btnGray me-3" onClick={() => { observar(compra.IdCompra); setId(compra.IdCompra) }}>
                        <EyeIcon />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex justify-center mt-4">
            <button onClick={() =>
              currentPage > 1 ? paginate(currentPage - 1) : paginate(currentPage)
            } className={`${currentPage > 1 ? "text-blue-gray-300 mx-1" : "text-blue-gray-100 mx-1 cursor-not-allowed"}`}>
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            {[...Array(Math.ceil(filteredElements.length / elementos)).keys()].map((number) => (
              <li key={number} className="cursor-pointer mx-1 flex items-center">
                <button onClick={() => paginate(number + 1)} className={`rounded p-2 ${currentPage === number + 1 ? 'btnRed text-white' : 'bg-white text-black'}`}>
                  {number + 1}
                </button>
              </li>
            ))}
            <button onClick={() =>
              currentPage < filteredElements.length / elementos ? paginate(currentPage + 1) : paginate(currentPage)
            } className={`${currentPage < filteredElements.length / elementos ? "text-blue-gray-300 mx-1" : "text-blue-gray-100 mx-1 cursor-not-allowed"}`}>
              <ChevronRightIcon className="w-6 h-6" />
            </button>
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
                        Número de factura {obsList.find(obs => obs.NumeroFactura)?.NumeroFactura || ''}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <div className="grid grid-cols-2 items">
                        <div className="border-l-[1px] border-t-[1px] border-b-[1px] border-collapse max-w-xs border-gray-300 flex justify-center items-center">
                          <div>
                            <strong>Proveedor</strong><br />
                            <span className="flex">{obsList.find(obs => obs.Proveedor)?.Proveedor}</span>
                          </div>
                        </div>
                        <div className="border-[1px] border-collapse max-w-xs border-gray-300 flex justify-center items-center">
                          <div>
                            <strong>Fecha</strong><br />
                            <span>{obsList.find(obs => obs.Fecha)?.Fecha}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <table className="w-full min-w-[640px] table-auto mt-5">
                          <thead>
                            <tr>
                              {["Cantidad", "Insumo", "Valor", "Subtotal"].map((el) => (
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
                              <tr key={index} id={`obs${obs.IdCompra}`}>
                                <td className="border-b border-blue-gray-50 py-3 px-5">{obs.Cantidad}</td>
                                <td className="border-b border-blue-gray-50 py-3 px-5">{obs.insumo}</td>
                                <td className="border-b border-blue-gray-50 py-3 px-5">${formatNumber(obs.Valor)}</td>
                                <td className="border-b border-blue-gray-50 py-3 px-5">${formatNumber(obs.Cantidad * obs.Valor)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="pt-4"><strong>Total: </strong>${formatNumber(comprasResumidas.filter(c => c.IdCompra === id).map(c => c.Total))}</div>
                    </CardBody>
                    <CardFooter className="pt-3">
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
    </div>
  );
}
export default Compras;
