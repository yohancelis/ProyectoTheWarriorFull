import React, { useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Input, Button, CardFooter } from "@material-tailwind/react";
import Axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate, } from 'react-router-dom';
import { PlusIcon, TrashIcon, ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Select from 'react-select';

export function Gestionventas() {
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
      title: "¿Desea terminar el registro de esta venta?",
      showCancelButton: true,
      confirmButtonColor: "rgb(180,40,20)",
      confirmButtonText: "Si",
      cancelButtonColor: "rgb(40,150,20)",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard/ventas")
      }
    });
  }

  // Estados para la gestión de ventas
  const [ventasList, setVentasL] = useState([]);
  const [serviciosList, setServiciosL] = useState([]);
  const [ventServList, setVentServL] = useState([]);
  const [empleadosList, setEmpleadosL] = useState([]);
  const [clientesList, setClientesL] = useState([]);
  const [usuariosList, setUsuariosL] = useState([]);

  const [selectBarbero, setSelectBarbero] = useState("");
  const BarberoOptions = usuariosList
    .filter(u => u.Estado === true && u.IdRol === 2)
    .flatMap(u =>
      empleadosList
        .filter(e => e.IdUsuario === u.IdUsuario)
        .map(e => ({ value: e.IdEmpleado, label: u.Usuario }))
    );

  const [selectCliente, setSelectCliente] = useState("");
  const ClienteOptions = usuariosList
    .filter(u => u.Estado === true && u.IdRol === 3)
    .flatMap(u =>
      clientesList
        .filter(c => c.IdUsuario === u.IdUsuario)
        .map(c => ({ value: c.IdCliente, label: u.Usuario }))
    );

  const [selectServicio, setSelectServicio] = useState(null);
  const servicioOptions = serviciosList.map(serv => ({ value: serv.IdServicio, label: serv.NombreDelServicio }));

  const fechaActual = new Date().toISOString().split("T")[0];
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() - 7);
  const fechaMinimaFormateada = fechaMinima.toISOString().split('T')[0];
  const fechaMaxima = new Date();
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);
  const fechaMaximaFormateada = fechaMaxima.toISOString().split('T')[0];

  const [numfactura, setNumFactura] = useState("");
  const [FechaRegistro, setFechaRegistro] = useState(fechaActual);
  const [empleado, setEmpleado] = useState("");
  const [cliente, setCliente] = useState("");
  const [servicio, setServicios] = useState("");
  const [preciototal, setPrecioTotal] = useState(0);
  const [precio, setPrecio] = useState(0);

  const [errorAll, setErrorAll] = useState(false);
  const [errorNumfactura, setErrorNumFactura] = useState(false);
  const [errorFechaRegistro, setErrorFechaRegistro] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState(false);
  const [errorCliente, setErrorCliente] = useState(false);
  const [errorServicio, setErrorServicios] = useState(false);
  const [errorPreciototal, setErrorPrecioTotal] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState(false);

  const [ventasTabla, setVentasLTabla] = useState([]);

  const [loading, setLoading] = useState(false);

  // URLs de las APIs
  const URLVentas = "http://localhost:8080/api/ventas";
  const URLServicios = "http://localhost:8080/api/servicios";
  const URLVentxServ = "http://localhost:8080/api/ventasxservicios";
  const URLEmpleados = "http://localhost:8080/api/empleados";
  const URLClientes = "http://localhost:8080/api/clientes";
  const URLUsuarios = "http://localhost:8080/api/usuarios";

  // Métodos para obtener datos de la API
  const getVentas = async () => {
    try {
      const resp = await Axios.get(URLVentas);
      setVentasL(resp.data.ventas);
    } catch (error) {
      console.error("Error al obtener datos de la venta: ", error);
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

  const getVentServ = async () => {
    try {
      const resp = await Axios.get(URLVentxServ);
      setVentServL(resp.data.ventasxservicios);
    } catch (error) {
      console.error("Error al obtener datos de los detalles de servicios:", error);
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

  const getEmpleados = async () => {
    try {
      const resp = await Axios.get(URLEmpleados);
      setEmpleadosL(resp.data.empleados);
    } catch (error) {
      showAlert("error", "Error al obtener datos de los empleados");
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

  useEffect(() => {
    getServicios();
    getVentas();
    getVentServ();
    getUsuarios();
    getClientes();
    getEmpleados();
  }, []);

  const [bloquearFecha, setBloquearFecha] = useState(false);

  const agregarVentaATabla = () => {
    setErrorAll(false);
    setErrorNumFactura(false);
    setErrorFechaRegistro(false);
    setErrorEmpleado(false);
    setErrorCliente(false);
    setErrorServicios(false);
    setErrorPrecio(false);
    setErrorPrecioTotal(false);
    if (!numfactura && !empleado && !cliente && !servicio && !FechaRegistro) {
      setErrorAll(true);
      return showAlert("error", "Por favor complete todos los campos");
    } else if (!FechaRegistro) {
      setErrorFechaRegistro(true);
      return showAlert("error", "Seleccione una fecha.");
    } else if (FechaRegistro < fechaMinimaFormateada || FechaRegistro > fechaMaximaFormateada) {
      setErrorFechaRegistro(true);
      return showAlert("error", "Seleccione una fecha válida.");
    } else if (!empleado) {
      setErrorEmpleado(true);
      return showAlert("error", "Seleccione un barbero.");
    } else if (!cliente) {
      setErrorCliente(true);
      return showAlert("error", "Seleccione un cliente.");
    } else if (!servicio) {
      setErrorServicios(true);
      return showAlert("error", "Seleccione un servicio.");
    } else if (ventasTabla.some((serv) => (serv.servicio === servicio))) {
      //el método some verifica si algún elemento del array "ventasTabla" tiene el mismo servicio que se está intentando agregar. Si encuentra una coincidencia, significa que el servicio ya está presente, el método some devuelve un valor booleano.
      return showAlert("error", "Ese servicio ya está agregado.");
    }
    const pre = serviciosList.find((serv) => (parseInt(serv.IdServicio) == parseInt(servicio) && serv?.Precio)).Precio;
    setPrecioTotal(preciototal + pre);
    // Crear un objeto con los datos de la venta
    const nuevaVenta = {
      numFactura: numfactura,
      empleado: empleado,
      cliente: cliente,
      servicio: servicio,
      fecha: FechaRegistro,
      preciototal: pre,
    };
    showAlert("success", "Servicio agregado.");
    setServicios("");
    setSelectServicio(null);
    setPrecio(0);
    // Agregar la nueva venta a la tabla. El operador de propagación, o spread operator '...', es una característica de JavaScript para descomponer arrays u objetos.
    setVentasLTabla([...ventasTabla, nuevaVenta]);
    if (!nuevaVenta == "") { setBloquearFecha(true); } else { setBloquearFecha(false); }
  };

  const delServ = (servicio) => {
    ventasTabla.filter(venta => {
      venta.preciototal !== servicio.preciototal
      showAlert("success", "Servicio eliminado.");
      return (setPrecioTotal(preciototal - servicio.preciototal))
    })
    setVentasLTabla(ventasTabla.filter(venta => venta.servicio !== servicio.servicio))
    if (ventasTabla.map((vt) => (vt)).length <= 1) { setBloquearFecha(false) } else { setBloquearFecha(true) }
  };

  const postVenta = async () => {
    setErrorAll(false);
    if (ventasTabla == "") {
      setErrorAll(true);
      showAlert("error", "La tabla está vacía.");
      return;
    }
    showAlert("info", "Registrando venta...");
    setLoading(true);
    Axios.post(URLVentas, {
      CodFactura: numfactura,
      IdEmpleado: empleado,
      IdCliente: cliente,
      FechaRegistro: FechaRegistro,
    }).then(() => {
      setTimeout(() => {
        postVentaServicio(numfactura);
      }, 500)
    })
  };

  const postVentaServicio = async (cod) => {
    Axios.get(`${URLVentas}/${cod}`).then((response) => {
      const codVentaNueva = response.data.codfactura;
      const id = codVentaNueva.find(cvn => cvn)?.IdVenta;
      ventasTabla.map(async vt => (
        await Axios.post(URLVentxServ, {
          IdVenta: id,
          IdServicio: vt.servicio,
          ValorServicio: vt.preciototal
        }).then(() => {
          setTimeout(() => {
            showAlert("success", "Venta registrada exitosamente.");
            setNumFactura(0)
            setServicios("")
            setEmpleado("")
            setCliente("")
            setFechaRegistro("");
            setPrecioTotal(0)
            setVentasLTabla([]);
            setLoading(false);
            getUsuarios();
            setTimeout(() => {
              navigate("/dashboard/ventas");
            }, 500);
          }, 500);
        }).catch((error) => {
          showAlert("error", "Error al enviar el detalle.");
          console.error("Error al enviar el detalle:", error);
        })
      ))
    }).catch((error) => {
      showAlert("error", "Error al obtener el ID de la venta.");
      console.error("Error al obtener el ID de la venta:", error);
    });
  };

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
            Registro de Ventas
          </Typography>
        </CardHeader>
        <CardBody className="pt-0 pb-5">
          <div className={`${errorAll || errorNumfactura ? "divError" : ""} gap-3`}>
            <Input
              className={`${errorAll || errorNumfactura ? "error" : ""}`}
              label="Número de Factura"
              value={numfactura}
              readOnly />
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
                  let cod = ventasList.map((vent) => (vent.CodFactura !== undefined && vent.CodFactura)).reverse()[0];
                  setNumFactura(cod != undefined ? cod + 1 : 1000);
                  setFechaRegistro(event.target.value)
                }} />
            </div>
            <div className={`${errorAll || errorEmpleado ? "divError" : ""} mt-3`}>
              <Select
                className={`${errorAll || errorEmpleado ? "error" : ""} text-gray-600 w-full`}
                placeholder="Seleccione un barbero"
                isDisabled={bloquearFecha ? true : false}
                isSearchable
                value={selectBarbero}
                options={BarberoOptions}
                onChange={(selBarb) => {
                  let cod = ventasList.map((vent) => (vent.CodFactura !== undefined && vent.CodFactura)).reverse()[0];
                  setNumFactura(cod != undefined ? cod + 1 : 1000);
                  setSelectBarbero(selBarb);
                  setEmpleado(selBarb.value);
                }} />
            </div>
            <div className={`${errorAll || errorCliente ? "divError" : ""} mt-3`}>
              <Select
                className={`${errorAll || errorCliente ? "error" : ""} text-gray-600 w-full`}
                placeholder="Seleccione un cliente"
                isDisabled={bloquearFecha ? true : false}
                isSearchable
                value={selectCliente}
                options={ClienteOptions}
                onChange={(selCli) => {
                  let cod = ventasList.map((vent) => (vent.CodFactura !== undefined && vent.CodFactura)).reverse()[0];
                  setNumFactura(cod != undefined ? cod + 1 : 1000);
                  setSelectCliente(selCli);
                  setCliente(selCli.value);
                }} />
            </div>
            <div className={`${errorAll || errorServicio ? "divError" : ""} mt-3`}>
              <Select
                className={`${errorAll || errorServicio ? "error" : ""} text-gray-600 w-full`}
                placeholder="Seleccione un servicio"
                isSearchable
                value={selectServicio}
                options={servicioOptions}
                onChange={(selServ) => {
                  let cod = ventasList.map((vent) => (vent.CodFactura !== undefined && vent.CodFactura)).reverse()[0];
                  setNumFactura(cod != undefined ? cod + 1 : 1000);
                  setSelectServicio(selServ);
                  setServicios(selServ.value);
                  setPrecio(serviciosList.filter(s => s.IdServicio === selServ.value).map(s => s.Precio));
                }} />
            </div>
            <div className={`${errorAll || errorPrecio ? "divError" : ""} mt-3`}>
              <Input
                className={`${errorAll || errorPrecio ? "error" : ""}`}
                label="Precio"
                value={`$${formatNumber(precio)}`}
                readOnly />
            </div>
          </div>
          <div className="flex justify-center items-center mt-3">
            <Button className="btnGreen py-3 px-4 flex items-center" onClick={() => { agregarVentaATabla() }}>Agregar</Button>
            <Button className="btnRed py-3 px-4 ms-5 flex items-center" onClick={() => { showAlertWarning() }}>Cancelar</Button>
          </div>
        </CardBody>
      </Card>
      <Card className="col-span-4">
        <CardHeader variant="gradient" className="mb-8 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Servicios Registrados
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["servicio", "Precio", "Acciones"].map((el) => (
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
              {ventasTabla.map((venta, index) => (
                <tr key={index}>
                  <td className="w-52 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{serviciosList.map((serv) => (venta.servicio.toString() === serv.IdServicio.toString() && serv.NombreDelServicio))}</div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${formatNumber(venta.preciototal)}</div>
                  </td>
                  <td className="w-28 px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button onClick={() => (delServ(venta))} className="text-xs font-semibold btnFunciones btnRed"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="px-6 pt-3 pb-4 grid grid-cols-5">
          <div className="flex justify-center items-center col-start-3">
            <Button className="btnGreen py-3 px-4 flex items-center" onClick={() => { postVenta() }}>Crear venta</Button>
          </div>
          <div className={`${errorAll ? "error" : ""} col-start-5`}>
            <strong>Total: </strong>${formatNumber(preciototal)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Gestionventas;