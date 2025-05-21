import React, { useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button, CardFooter } from "@material-tailwind/react";
import Axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate, } from 'react-router-dom';
import { PlusIcon, TrashIcon, ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';

export function GestionCompras() {
  const navigate = useNavigate();

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

  function showAlertWarning() {
    Swal.fire({
      title: "¿Desea terminar el registro de esta compra?",
      showCancelButton: true,
      confirmButtonColor: "rgb(180,40,20)",
      confirmButtonText: "Si",
      cancelButtonColor: "rgb(40,150,20)",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard/compras")
      }
    });
  }

  // Estados para la gestión de ventas
  const [comprasList, setComprasL] = useState([]);
  const [productosList, setProductosL] = useState([]);
  const [proveedoresList, setProveedoresL] = useState([]);
  const [comprasProductosList, setComprasProductosL] = useState([]);
  const [comprasTabla, setComprasLTabla] = useState([]);

  const [selectProveedores, setSelectProveedores] = useState("");
  const proveedorOptions = proveedoresList.filter(p => p).map(p => ({ value: p.IdProveedor, label: p.NombreProveedor }))

  const [selectproducto, setSelectProducto] = useState(null);
  const productoOptions = productosList.map(comp => ({ value: comp.IdProducto, label: comp.NombreProducto }));

  const fechaActual = new Date().toISOString().split("T")[0];
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() - 7);
  const fechaMinimaFormateada = fechaMinima.toISOString().split('T')[0];
  const fechaMaxima = new Date();
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);
  const fechaMaximaFormateada = fechaMaxima.toISOString().split('T')[0];

  const [numfactura, setNumFactura] = useState("");
  const [FechaRegistro, setFechaRegistro] = useState(fechaActual);
  const [proveedor, setProveedor] = useState("");
  const [insumo, setProductos] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState(0);
  const [preciototal, setPrecioTotal] = useState(0);

  const [errorAll, setErrorAll] = useState(false);
  const [errorNumfactura, setErrorNumFactura] = useState(false);
  const [errorFechaRegistro, setErrorFechaRegistro] = useState(false);
  const [errorProveedor, setErrorProveedor] = useState(false);
  const [errorProducto, setErrorProductos] = useState(false);
  const [errorCantidad, setErrorCantidad] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState(false);

  const [loading, setLoading] = useState(false);

  // URLs de las APIs
  const URLCompras = "http://localhost:8080/api/compras";
  const URLProveedores = "http://localhost:8080/api/proveedores";
  const URLGestionProductos = "http://localhost:8080/api/gestionproductos";
  const URLProdComp = "http://localhost:8080/api/detalleProductosCompras"

  // Métodos para obtener datos de la API
  const getCompras = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLCompras);
      setComprasL(resp.data.compras);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de la venta: ", error);
    }
  };

  const getProveedores = async () => {
    try {
      const resp = await Axios.get(URLProveedores);
      setProveedoresL(resp.data.proveedores);
    } catch (error) {
      console.error("Error al obtener datos de los servicios:", error);
    }
  };

  const getComprasProduc = async () => {
    try {
      const resp = await Axios.get(URLProdComp);
      setComprasProductosL(resp.data.detalleProductosCompras);
    } catch (error) {
      showAlert("Error al obtener los datos deL detalle compras insumos: ", error);
    }
  }

  const getProductos = async () => {
    try {
      const resp = await Axios.get(URLGestionProductos);
      setProductosL(resp.data.gestionproductos);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  useEffect(() => {
    getCompras();
    getProveedores();
    getComprasProduc();
    getProductos();
  }, []);

  const [bloquearFecha, setBloquearFecha] = useState(false);

  const agregarCompraATabla = async () => {
    setErrorAll(false);
    setErrorNumFactura(false);
    setErrorFechaRegistro(false);
    setErrorProveedor(false);
    setErrorProductos(false);
    setErrorCantidad(false);
    setErrorPrecio(false);
    if (!numfactura && !FechaRegistro && !proveedor && !insumo && !cantidad) {
      setErrorAll(true);
      return showAlert("error", "Por favor complete todos los campos");
    } else if (numfactura === "") {
      setErrorNumFactura(true);
      return showAlert("error", "El campo numero de factura no puede estar vacio.");
    } else if (numfactura <= 0) {
      setErrorNumFactura(true);
      return showAlert("error", "Esa factura es válida.");
    } else if (comprasList.find(cl => cl.NumeroFactura === parseInt(numfactura))?.NumeroFactura) {
      setErrorNumFactura(true);
      return showAlert("error", "Esa factura ya está registrada.");
    } else if (!FechaRegistro) {
      setErrorFechaRegistro(true);
      return showAlert("error", "Seleccione una fecha.");
    } else if (FechaRegistro < fechaMinimaFormateada || FechaRegistro > fechaMaximaFormateada) {
      setErrorFechaRegistro(true);
      return showAlert("error", "Seleccione una fecha válida.");
    } else if (!proveedor) {
      setErrorProveedor(true);
      return showAlert("error", "Seleccione un proveedor.");
    } else if (!insumo) {
      setErrorProductos(true);
      return showAlert("error", "Seleccione un insumo.");
    } else if (comprasTabla.some((comp) => comp.insumo === insumo)) {
      return showAlert("error", "Ese insumo ya está agregado.");
    } else if (!cantidad) {
      setErrorCantidad(true);
      return showAlert("error", "Agregue una cantidad.");
    }
    const pre = productosList.find((comp) => (parseInt(comp.IdProducto) == parseInt(insumo) && comp?.PrecioUnitario)).PrecioUnitario;
    const precioTotalCalculado = pre * cantidad;
    setPrecioTotal(preciototal + precioTotalCalculado);
    const nuevaCompra = {
      numFactura: numfactura,
      proveedor: proveedor,
      insumo: insumo,
      fecha: FechaRegistro,
      cantidad: cantidad,
      PrecioUnitario: pre,
      preciototal: precioTotalCalculado,
    };
    showAlert("success", "Compra agregada a la tabla.");
    setProductos("");
    setCantidad("");
    setSelectProducto(null);
    setPrecio(0);
    setComprasLTabla([...comprasTabla, nuevaCompra]);
    if (!nuevaCompra == "") { setBloquearFecha(true); } else { setBloquearFecha(false); }
  };

  const delServ = (insumo) => {
    comprasTabla.filter(compra => {
      compra.preciototal !== insumo.preciototal
      return (setPrecioTotal(preciototal - insumo.preciototal))
    })
    setComprasLTabla(comprasTabla.filter(compra => compra.insumo !== insumo.insumo))
    if (comprasTabla.map((ct) => (ct)).length <= 1) { setBloquearFecha(false) } else { setBloquearFecha(true) }
  };

  const postCompra = async () => {
    if (comprasTabla == "") {
      setErrorAll(true);
      showAlert("error", "La tabla está vacía.");
      return;
    }
    showAlert("info", "Registrando compra...");
    setLoading(true);
    await Axios.post(URLCompras, {
      NumeroFactura: numfactura,
      IdProveedor: proveedor,
      IdProducto: insumo,
      FechaRegistro: FechaRegistro,
      Valor: preciototal,
    }).then(async () => {
      setTimeout(() => {
        postComprasProductos(numfactura);
      }, 500)
    })
  }

  const postComprasProductos = async (cod) => {
    Axios.get(`${URLCompras}/${cod}`).then(async (response) => {
      const codCompraNueva = response.data.numfactura;
      const id = codCompraNueva.find(cvn => cvn)?.IdCompra;
      comprasTabla.map(async ct => (
        await Axios.post(URLProdComp, {
          IdCompra: id,
          IdProducto: ct.insumo,
          Cantidad: ct.cantidad,
          Valor: ct.PrecioUnitario
        }).then(() => {
          setTimeout(() => {
            showAlert("success", "Compra registrada exitosamente.");
            setNumFactura(0);
            setProductos("");
            setProveedor("");
            setFechaRegistro("");
            setPrecioTotal(0);
            setComprasLTabla([]);
            setLoading(false);
            getCompras();
            setTimeout(() => {
              navigate("/dashboard/compras");
            }, 500);
          }, 500);
        }).catch((error) => {
          showAlert("error", "Error al enviar el detalle.");
          console.error("Error al enviar el detalle:", error);
        })
      ))
    }).catch((error) => {
      showAlert("error", "Error al obtener el ID de la compra.");
      console.error("Error al obtener el ID de la compra:", error);
    });
  }

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  return (
    <div className="mt-12 mb-5 grid grid-cols-6 gap-4">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Card className="col-span-2 max-h-[425px]">
        <CardHeader variant="gradient" className="mb-4 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Registro de Compras
          </Typography>
        </CardHeader>
        <CardBody className="pt-0 pb-5">
          <div className={`${errorAll || errorNumfactura ? "divError" : ""}`}>
            <Input
              className={`${errorAll || errorNumfactura ? "error" : ""}`}
              label="Número de Factura"
              type="number"
              value={numfactura}
              readOnly={bloquearFecha ? true : false}
              onChange={(event) => setNumFactura(event.target.value)}
            />
            <div className={`${errorAll || errorFechaRegistro ? "divError" : ""} mt-3`}>
              <Input
                className={`${errorAll || errorFechaRegistro ? "error errorEmpty" : ""}`}
                label="Fecha de Registro"
                value={FechaRegistro}
                type="date"
                min={fechaMinimaFormateada}
                max={fechaMaximaFormateada}
                readOnly={bloquearFecha ? true : false}
                onChange={(event) => {
                  setFechaRegistro(event.target.value)
                }} />
            </div>
            <div className={`${errorAll || errorProveedor ? "divError" : ""} mt-3`}>
              <Select
                className={`${errorAll || errorProveedor ? "error" : ""} w-full`}
                placeholder="Seleccione un proveedor"
                isDisabled={bloquearFecha ? true : false}
                isSearchable
                value={selectProveedores}
                options={proveedorOptions}
                onChange={(selProv) => {
                  setSelectProveedores(selProv);
                  setProveedor(selProv.value);
                }} />
            </div>
            <div className={`${errorAll || errorProducto ? "divError" : ""} mt-3`}>
              <Select
                className={`${errorAll || errorProducto ? "error" : ""} w-full`}
                placeholder="Seleccione un insumo"
                isSearchable
                value={selectproducto}
                options={productoOptions}
                onChange={(selProd) => {
                  setSelectProducto(selProd);
                  setProductos(selProd.value);
                  setPrecio(productosList.filter(p => p.IdProducto === selProd.value).map(p => p.PrecioUnitario));
                }} />
            </div>
            <div className={`${errorAll || errorCantidad ? "divError" : ""} mt-3`}>
              <Input
                className={`${errorAll || errorCantidad ? "error" : ""}`}
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(event) => setCantidad(event.target.value)}
              />
            </div>
            <div className={`${errorAll ? "divError" : ""} mt-3`}>
              <Input
                className={`${errorAll ? "error" : ""}`}
                label="Precio"
                value={`$${formatNumber(precio)}`}
                readOnly />
            </div>
          </div>

          <div className="flex justify-center items-center mt-3">
            <Button className="btnGreen py-3 px-4 me-10 flex items-center" onClick={() => { agregarCompraATabla() }}>Agregar</Button>
            <Button className="btnRed py-3 px-4 ms-10 flex items-center" onClick={() => { showAlertWarning() }}>Cancelar</Button>
          </div>
        </CardBody>
      </Card>
      <Card className="col-span-4">
        <CardHeader variant="gradient" className="mb-4 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Insumos Registrados
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Cantidad", "insumo", "Valor Unitario", "SubTotal", "Acciones"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography
                      variant="small"
                      className="text-[13px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody id="IdBodyTable" className="border-b">
              {comprasTabla.map((compra, index) => (
                <tr key={index}>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{(compra.cantidad)}</div>
                  </td>
                  <td className="w-52 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{productosList.map((comp) => (compra.insumo.toString() === comp.IdProducto.toString() && comp.NombreProducto))}</div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${formatNumber(compra.PrecioUnitario)}</div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${formatNumber(compra.preciototal)}</div>
                  </td>
                  <td className="w-28 px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button onClick={() => (delServ(compra))} className="text-xs font-semibold btnFunciones btnRed"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="px-6 pt-0 pb-4 grid grid-cols-5">
          <div className="flex justify-center items-center col-start-3">
            <Button className="btnGreen py-3 px-4 flex items-center" onClick={() => { postCompra() }}>Crear Compra</Button>
          </div>
          <div className={`${errorAll ? "error" : ""} col-start-5`}>
            <strong>Total: </strong>${formatNumber(preciototal)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default GestionCompras;
