import React, { Fragment, useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, CardFooter, Input, Button } from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react';
import Axios from "axios";
import Swal from 'sweetalert2';
import { PencilSquareIcon, CalendarIcon, TrashIcon } from "@heroicons/react/24/solid";
import Select from 'react-select';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import "/public/css/fullcalendar.css";
import { format, parse, parseISO } from 'date-fns';

export function Agenda() {
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
      title: title,
    });
  }

  const showAlertWarning = () => {
    Swal.fire({
      title: "¿Desea cancelar el registro de esta agenda?",
      showCancelButton: true,
      confirmButtonColor: "rgb(180,40,20)",
      confirmButtonText: "Si",
      cancelButtonColor: "rgb(40,150,20)",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setOpen(false)
        setLoading(true)
        setTimeout(() => {
          empty()
        }, 500);
      }
    });
  }

  function cancelarCita() {
    Swal.fire({
      title: "¿Está seguro de cancelar esta cita?",
      showCancelButton: true,
      confirmButtonColor: "rgb(180,40,20)",
      confirmButtonText: "Si",
      cancelButtonColor: "rgb(40,150,20)",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await putEstado();
      }
    });
  }

  //se crean las listas en las que se van a guardar datos de las apis
  const [agendaList, setAgenda] = useState([]);
  const [serviciosList, setServiciosL] = useState([]);
  const [agendaServiciosList, setAgendaServiciosL] = useState([]);
  const [usuariosList, setUsuariosL] = useState([]);
  const [empleadosList, setEmpleadosL] = useState([]);
  const [clientesList, setClientesL] = useState([]);
  const [horaLaboral, setHoraLaboral] = useState([]);

  const fechaActual = new Date().toISOString().split("T")[0];
  const fechaMaxima = new Date();
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);
  const fechaMaximaFormateada = fechaMaxima.toISOString().split('T')[0];
  // fechaMaxima.setHours(15, 0, 0, 0); 
  // const f = fechaMaxima.toLocaleDateString();
  // const h = fechaMaxima.toLocaleTimeString();
  // const FM = `${f} ${h}`;
  // const fechaMaximaFormateada = fechaMaxima.toISOString().split('.')[0].replace('T', ' ');

  const [servicio, setServicio] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [cliente, setCliente] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState(fechaActual);
  const [hora, setHora] = useState("");
  const [valor, setValor] = useState(0);

  const [errorAll, setErrorAll] = useState(false);
  const [errorServicio, setErrorServicio] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState(false);
  const [errorCliente, setErrorCliente] = useState(false);
  const [errorEstado, setErrorEstado] = useState(false);
  const [errorFecha, setErrorFecha] = useState(false);
  const [errorHora, setErrorHora] = useState(false);
  const [errorValor, setErrorValor] = useState(false);

  const [selectServicio, setSelectServicio] = useState(null);
  const servicioOptions = serviciosList.map(serv => ({ value: serv.IdServicio, label: serv.NombreDelServicio }));

  const [selectBarbero, setSelectBarbero] = useState("");
  const BarberoOptions = usuariosList
    .filter(u => u.Estado === true && u.IdRol === 2)
    .flatMap(u =>
      empleadosList
        .filter(e => e.IdUsuario === u.IdUsuario)
        .map(e => ({ value: e.IdEmpleado ? e.IdEmpleado : "Cargando usuario...", label: u.Usuario ? u.Usuario : "Cargando usuario..." }))
    );

  const [selectCliente, setSelectCliente] = useState(null);
  const ClienteOptions = usuariosList
    .filter(u => u.Estado === true && u.IdRol === 3)
    .flatMap(u =>
      clientesList
        .filter(c => c.IdUsuario === u.IdUsuario)
        .map(c => ({ value: c.IdCliente ? c.IdCliente : "Cargando usuario...", label: u.Usuario ? u.Usuario : "Cargando usuario..." }))
    );

  const [selectHora, setSelectHora] = useState(null);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);

  const [AgendaTabla, setAgenaLTabla] = useState([]);
  const [precioTotal, setPrecioTotal] = useState(0);
  const [bloquear, setBloquear] = useState(false);
  const [servCancelado, setServCancelado] = useState(false);

  const [loading, setLoading] = useState(false);

  // Función para convertir una hora en minutos
  const convertToMinutes = time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const HoursOptions = horaLaboral ? horaLaboral.filter(hour => {
    let valDate = agendaList.filter(al => al.FechaAgenda === fecha);
    let agendasPorFechaYEmpleado = valDate.filter(al => al.IdEmpleado === empleado && al.Estado != "Cancelado");

    // const serviciosConMasDeUnServicio = agendaServiciosList.filter(asl => agendasPorFechaYEmpleado.some(afe => asl?.IdAgenda === afe?.IdAgenda));
    // console.log("\nAgenda fecha empleado: ", agendasPorFechaYEmpleado);
    // console.log("Detalle agenda fecha empleado: ", agendaServiciosList);
    // console.log("Más de un servicio: ", serviciosConMasDeUnServicio);

    // Convertir la hora actual a minutos
    const hourMinutes = convertToMinutes(hour.value);

    return !agendasPorFechaYEmpleado.some(al => {
      const startMinutes = convertToMinutes(al.HoraInicio);
      const endMinutes = convertToMinutes(al.HoraFin);

      if (edit) {
        const hIni = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraInicio)
        const hFin = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraFin)
        if (edit && (startMinutes === hIni || endMinutes === hFin)) {
          return false;
        }
      }
      const estado = agendaList.find(al => al.IdAgenda === id)?.Estado
      // console.log(empleado)
      // Verificar si la hora actual cae dentro del rango de 30 minutos de diferencia
      return (estado != "Cancelado" && hourMinutes >= startMinutes && hourMinutes < startMinutes + 30) ||
        (estado != "Cancelado" && hourMinutes >= startMinutes + 30 && hourMinutes < endMinutes);
    });
  }).map(hour => ({ value: hour.value, label: hour.label })) : "Cargando...";

  function generateTimeOptions(startHour, endHour) {
    const times = [];
    let currentHour = startHour;
    let currentMinutes = 0;

    while (currentHour < endHour || (currentHour === endHour && currentMinutes === 0)) {
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const formattedHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
      const formattedMinutes = currentMinutes === 0 ? '00' : '30';
      const formattedTime = `${formattedHour}:${formattedMinutes} ${ampm}`;

      const hour24 = currentHour < 10 ? `0${currentHour}` : `${currentHour}`;
      const minutes24 = currentMinutes === 0 ? '00' : '30';
      const time24 = `${hour24}:${minutes24}:00`;

      times.push({ label: formattedTime, value: time24 });

      // Increment by 30 minutes
      currentMinutes += 30;
      if (currentMinutes === 60) {
        currentMinutes = 0;
        currentHour += 1;
      }
    }
    return setHoraLaboral(times);
  }

  //URL de las API
  const URLAgenda = "http://localhost:8080/api/agenda";
  const URLServicios = "http://localhost:8080/api/servicios";
  const URLAgendaServicios = "http://localhost:8080/api/detalleagendaservicio";
  const URLEmpleados = "http://localhost:8080/api/empleados";
  const URLClientes = "http://localhost:8080/api/clientes";
  const URLUsuarios = "http://localhost:8080/api/usuarios";

  //funcion para vaciar las variables
  const empty = async () => {
    setOpen(false);
    setLoading(false);
    setErrorAll(false);
    setErrorServicio(false);
    setErrorEmpleado(false);
    setErrorCliente(false);
    setErrorEstado(false);
    setErrorFecha(false);
    setErrorHora(false);
    setErrorValor(false);
    setBloquear(false);
    setServicio("");
    setEmpleado("");
    setCliente("");
    setEstado("");
    setFecha("");
    setHora("");
    setValor(0);
    setPrecioTotal(0);
    setAgenaLTabla([])
    setSelectServicio(null);
    setSelectBarbero(null);
    setSelectCliente(null);
    setSelectHora(null);
    setEdit(false);
    setServCancelado(false);
    setLoading(false)
    getAgenda();
    getServicios();
    getAgendaServicios();
    getClientes();
    getEmpleados();
    await getUsuarios();
  };

  //metodos o endpoints get
  const getAgenda = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLAgenda);
      setAgenda(resp.data.agenda);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de la agenda: ", error);
    }
  };

  const getServicios = async () => {
    try {
      const resp = await Axios.get(URLServicios);
      const data = resp.data.servicios;
      setServiciosL(data);
    } catch (error) {
      console.error("Error al obtener datos de los servicios: ", error);
    }
  };

  const getAgendaServicios = async () => {
    try {
      const resp = await Axios.get(URLAgendaServicios);
      const data = resp.data.detalleAgendaServicio;
      setAgendaServiciosL(data);
    } catch (error) {
      console.error("Error al obtener datos de los servicios: ", error);
    }
  };

  const getEmpleados = async () => {
    try {
      const resp = await Axios.get(URLEmpleados);
      const data = resp.data.empleados;
      setEmpleadosL(data);
    } catch (error) {
      console.error("Error al obtener datos de los empleados: ", error);
    }
  };

  const getClientes = async () => {
    try {
      const resp = await Axios.get(URLClientes);
      const data = resp.data.clientes;
      setClientesL(data);
    } catch (error) {
      console.error("Error al obtener datos de los clientes: ", error);
    }
  };

  const getUsuarios = async () => {
    try {
      const resp = await Axios.get(URLUsuarios);
      const data = resp.data.usuarios;
      setUsuariosL(data);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios: ", error);
    }
  };

  //se inicializa los metodos o endpoints get para que cargue la informacion
  useEffect(() => {
    generateTimeOptions(8, 19);
    getAgenda();
    getServicios();
    getAgendaServicios();
    getClientes();
    getEmpleados();
    getUsuarios();
  }, []);

  // Obtener la hora actual en minutos
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinutes;

  const agregarVentaATabla = async () => {
    getServicios();
    getAgendaServicios();
    getClientes();
    getEmpleados();
    getUsuarios();
    await getAgenda();
    setErrorAll(false);
    setErrorServicio(false);
    setErrorEmpleado(false);
    setErrorCliente(false);
    setErrorEstado(false);
    setErrorFecha(false);
    setErrorHora(false);
    setErrorValor(false);

    // Obtener las horas ocupadas para el barbero en la fecha seleccionada
    let valDate = agendaList.filter(al => al.FechaAgenda === fecha);
    let agendasPorFechaYEmpleado = valDate.filter(al => al.IdEmpleado === empleado);

    // Verificar si la hora seleccionada está ocupada o en el rango de media hora extra
    const hourMinutes = convertToMinutes(hora);
    const horaOcupada = agendasPorFechaYEmpleado.some(al => {
      const startMinutes = convertToMinutes(al.HoraInicio);
      const endMinutes = convertToMinutes(al.HoraFin);

      if (edit) {
        const hIni = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraInicio)
        const hFin = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraFin)
        if (edit && (startMinutes === hIni || endMinutes === hFin)) {
          return false;
        }
      }
      const estado = agendaList.find(al => al.IdAgenda === id)?.Estado
      // Verificar si la hora actual cae dentro del rango de 30 minutos de diferencia
      return (estado == "Cancelado" && hourMinutes >= startMinutes && hourMinutes < startMinutes + 30) ||
        (estado == "Cancelado" && hourMinutes >= startMinutes + 30 && hourMinutes < endMinutes);
    });
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const localDateString = `${localYear}-${localMonth}-${localDay}`;

    if (servicio == 0 && empleado == 0 && cliente == 0 && !fecha && !hora && !valor) {
      setErrorAll(true);
      return showAlert("error", "Complete los campos.");
    } else if (empleado == 0) {
      setErrorEmpleado(true);
      return showAlert("error", "Seleccione un empleado.");
    } else if (cliente == 0) {
      setErrorCliente(true);
      return showAlert("error", "Seleccione un cliente.");
    } else if (!fecha) {
      setErrorFecha(true);
      return showAlert("error", "Seleccione una fecha.");
    }
    if (!hora) {
      setErrorHora(true);
      return showAlert("error", "Seleccione una hora.");
    } else if (new Date(fecha).toISOString().split("T")[0] === localDateString && hourMinutes < currentTotalMinutes) {
      setErrorHora(true);
      return showAlert("error", "No se puede agendar a una hora menor a la actual.", 2500);
    } else if (horaOcupada) {
      setErrorHora(true);
      return showAlert("error", "Esa hora ya está ocupada para este barbero.", 2500);
    } else if (servicio == 0) {
      setErrorServicio(true);
      return showAlert("error", "Seleccione un servicio.");
    } else if (!valor) {
      setErrorValor(true);
      return showAlert("error", "Valor vacío.");
    } else if (AgendaTabla.some(serv => serv.servicio === servicio)) {
      setErrorServicio(true);
      return showAlert("error", "Ese servicio ya está agregado.");
    }
    const pre = serviciosList.find((serv) => (parseInt(serv.IdServicio) == parseInt(servicio) && serv?.Precio)).Precio;
    setPrecioTotal(precioTotal + pre);

    const [horas, minutos] = hora.split(':').map(Number); // Convertir cada parte de la hora a número
    let nuevaHora = horas;
    let nuevoMinuto = minutos + 30;
    if (nuevoMinuto >= 60) {
      nuevaHora++; // Incrementar la hora si los minutos exceden 60
      nuevoMinuto -= 60; // Restar 60 minutos para que esté dentro del rango
    }
    nuevaHora = String(nuevaHora).padStart(2, '0');
    nuevoMinuto = String(nuevoMinuto).padStart(2, '0');
    const horaFin = `${nuevaHora}:${nuevoMinuto}:00`;

    const nuevaVenta = {
      empleado: empleado,
      cliente: cliente,
      fecha: fecha,
      horaInicio: hora,
      horaFin: horaFin,
      servicio: servicio,
      valor: parseInt(valor)
    };
    showAlert("success", "Servicio agregado.");
    setServicio("");
    setSelectServicio(null);
    setValor(0);
    // Agregar la nueva venta a la tabla. El operador de propagación, o spread operator '...', es una característica de JavaScript para descomponer arrays u objetos.
    setAgenaLTabla([...AgendaTabla, nuevaVenta]);
    if (!nuevaVenta == "") { setBloquear(true); } else { setBloquear(false); }
  };

  const delServ = (servicio) => {
    AgendaTabla.filter(venta => {
      venta.valor !== servicio.valor
      showAlert("success", "Servicio eliminado.");
      return (setPrecioTotal(precioTotal - servicio.valor))
    })
    setAgenaLTabla(AgendaTabla.filter(venta => venta.servicio !== servicio.servicio))
    if (AgendaTabla.map((vt) => (vt)).length <= 1) { setBloquear(false) } else { setBloquear(true) }
  };

  //metodos o endpoints post
  const postAgenda = async () => {
    setErrorAll(false);
    setErrorServicio(false);
    setErrorEmpleado(false);
    setErrorCliente(false);
    setErrorEstado(false);
    setErrorFecha(false);
    setErrorHora(false);
    setErrorValor(false);

    // Obtener las horas ocupadas para el barbero en la fecha seleccionada
    let valDate = agendaList.filter(al => al.FechaAgenda === fecha);
    let agendasPorFechaYEmpleado = valDate.filter(al => al.IdEmpleado === empleado);

    // Verificar si la hora seleccionada está ocupada o en el rango de media hora extra
    const hourMinutes = convertToMinutes(hora);
    const horaOcupada = agendasPorFechaYEmpleado.some(al => {
      const startMinutes = convertToMinutes(al.HoraInicio);
      const endMinutes = convertToMinutes(al.HoraFin);
      const estado = agendaList.find(al => al.IdAgenda === id)?.Estado
      // Verificar si la hora actual cae dentro del rango de 30 minutos de diferencia
      return (estado == "Cancelado" && hourMinutes >= startMinutes && hourMinutes < startMinutes + 30) ||
        (estado == "Cancelado" && hourMinutes >= startMinutes + 30 && hourMinutes < endMinutes);
    });

    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const localDateString = `${localYear}-${localMonth}-${localDay}`;

    if (AgendaTabla == "") {
      setErrorAll(true);
      return showAlert("error", "La tabla está vacía.");
    } else if (new Date(fecha).toISOString().split("T")[0] === localDateString && hourMinutes < currentTotalMinutes) {
      setErrorHora(true);
      return showAlert("error", "La hora seleccionada es menor a la hora actual.");
    } else if (horaOcupada) {
      setErrorHora(true);
      return showAlert("error", "Esa hora ya está ocupada para este barbero.");
    }

    const [horas, minutos] = hora.split(':').map(Number); // Convertir cada parte de la hora a número
    let nuevaHora = horas;
    let nuevoMinuto = minutos + 30;
    if (nuevoMinuto >= 60) {
      nuevaHora++;
      nuevoMinuto -= 60;
    }
    if (AgendaTabla.length > 1) {
      nuevoMinuto += 30;
      if (nuevoMinuto >= 60) {
        nuevaHora++;
        nuevoMinuto -= 60;
      }
    }
    nuevaHora = String(nuevaHora).padStart(2, '0');
    nuevoMinuto = String(nuevoMinuto).padStart(2, '0');
    const horaFin = `${nuevaHora}:${nuevoMinuto}:00`;

    showAlert("info", "Registrando cita...");
    setLoading(true);
    setOpen(false);
    await Axios.post(URLAgenda, {
      IdEmpleado: empleado,
      IdCliente: cliente,
      Estado: "Pendiente",
      FechaAgenda: fecha,
      HoraInicio: hora,
      HoraFin: horaFin,
      IdServicio: AgendaTabla.map(at => at.servicio),
      Valor: AgendaTabla.map(at => at.valor),
    }).then(() => {
      setTimeout(async () => {
        showAlert("success", "Cita registrada con éxito.");
        empty();
      }, 500);
    }).catch((error) => {
      showAlert("error", "Error al registrar la agenda");
      console.error("Error al registrar la agenda:", error);
    });
  };

  //metodos o endpoints post
  const Edit = async (val) => {
    const detalleAgenda = agendaServiciosList.filter(asl => asl.IdAgenda === val.IdAgenda)
    const barbero = usuariosList.find(u => u.IdUsuario === empleadosList.find(e => e.IdEmpleado === val.IdEmpleado)?.IdUsuario)
    const cliente = usuariosList.find(u => u.IdUsuario === clientesList.find(e => e.IdCliente === val.IdCliente)?.IdUsuario)
    // const infoAgenda = {
    //   IdAgenda: val?.IdAgenda,
    //   IdEmpleado: { value: val?.IdEmpleado, label: barbero?.Usuario },
    //   IdCliente: { value: val?.IdCliente, label: cliente?.Usuario },
    //   Estado: val?.Estado,
    //   IdServicio: detalleAgenda.map((da) => ({ value: da.IdServicio, label: serviciosList.find(sl => sl.IdServicio === da.IdServicio)?.NombreDelServicio })),
    //   Valor: detalleAgenda.map((da) => ({ value: da.IdServicio, label: serviciosList.find(sl => sl.IdServicio === da.IdServicio)?.Precio })),
    //   FechaAgenda: val?.FechaAgenda,
    //   HoraInicio: val?.HoraInicio,
    //   HoraFin: val?.HoraFin,
    // }

    setOpen(true);
    setEdit(true);
    setId(val?.IdAgenda);
    setEmpleado(val?.IdEmpleado)
    setSelectBarbero({ value: val?.IdEmpleado, label: barbero?.Usuario })
    setCliente(val?.IdCliente)
    setSelectCliente({ value: val?.IdCliente, label: cliente?.Usuario })
    setFecha(val?.FechaAgenda);
    setHora(val?.HoraInicio);
    setSelectHora(HoursOptions.find(ho => ho.value === val?.HoraInicio));
    detalleAgenda.map(da => { setAgenaLTabla(prevAgendaTabla => [...prevAgendaTabla, { servicio: da.IdServicio, valor: da.Valor }]); });
    const precios = detalleAgenda.map((da) => (serviciosList.find(sl => sl.IdServicio === da.IdServicio)?.Precio));
    const precioTotal = precios.reduce((total, precio) => total + (precio || 0), 0);
    setPrecioTotal(precioTotal)
    if (userActive.IdRol == 2) {
      if (empleadosList.find(e => e.IdUsuario === userActive.IdUsuario)?.IdEmpleado !== val?.IdEmpleado && userActive.IdRol != 1) {
        setServCancelado(true);
      }
    }
    if (userActive.IdRol == 3) {
      if (clientesList.find(c => c.IdUsuario === userActive.IdUsuario)?.IdCliente !== val?.IdCliente && userActive.IdRol != 1) {
        setServCancelado(true);
      }
    }
  };

  const putEstado = async () => {
    const [horas, minutos] = hora.split(':').map(Number); // Convertir cada parte de la hora a número
    let nuevaHora = horas;
    let nuevoMinuto = minutos + 30;
    if (nuevoMinuto >= 60) {
      nuevaHora++;
      nuevoMinuto -= 60;
    }
    if (AgendaTabla.length > 1) {
      nuevoMinuto += 30;
      if (nuevoMinuto >= 60) {
        nuevaHora++;
        nuevoMinuto -= 60;
      }
    }
    nuevaHora = String(nuevaHora).padStart(2, '0');
    nuevoMinuto = String(nuevoMinuto).padStart(2, '0');
    const horaFin = `${nuevaHora}:${nuevoMinuto}:00`;

    showAlert("success", "Cancelando cita...");
    setOpen(false);
    setLoading(true);
    await Axios.put(URLAgenda, {
      IdAgenda: id,
      IdServicio: servicio,
      IdEmpleado: empleado,
      IdCliente: cliente,
      Estado: "Cancelado",
      FechaAgenda: fecha,
      HoraInicio: hora,
      HoraFin: horaFin,
      Valor: valor,
    }).then(() => {
      setTimeout(async () => {
        showAlert("success", "Cita cancelada con éxito.");
        empty();
        window.location.reload();
      }, 500);
    }).catch((error) => {
      showAlert("error", "Error al cancelar la agenda");
      console.error("Error al cancelar la agenda:", error);
    });
  }

  // console.log(AgendaTabla)
  const putAgenda = async () => {
    setErrorAll(false);
    setErrorServicio(false);
    setErrorEmpleado(false);
    setErrorCliente(false);
    setErrorEstado(false);
    setErrorFecha(false);
    setErrorHora(false);
    setErrorValor(false);

    // Obtener las horas ocupadas para el barbero en la fecha seleccionada
    let valDate = agendaList.filter(al => al.FechaAgenda === fecha);
    let agendasPorFechaYEmpleado = valDate.filter(al => al.IdEmpleado === empleado);

    // Verificar si la hora seleccionada está ocupada o en el rango de media hora extra
    const hourMinutes = convertToMinutes(hora);
    const horaOcupada = agendasPorFechaYEmpleado.some(al => {
      const startMinutes = convertToMinutes(al.HoraInicio);
      const endMinutes = convertToMinutes(al.HoraFin);

      if (edit) {
        const hIni = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraInicio)
        const hFin = convertToMinutes(agendaList.find(al => al.IdAgenda === id)?.HoraFin)
        if (edit && (startMinutes === hIni || endMinutes === hFin)) {
          return false;
        }
      }
      const estado = agendaList.find(al => al.IdAgenda === id)?.Estado
      // Verificar si la hora actual cae dentro del rango de 30 minutos de diferencia
      return (estado == "Cancelado" && hourMinutes >= startMinutes && hourMinutes < startMinutes + 30) ||
        (estado == "Cancelado" && hourMinutes >= startMinutes + 30 && hourMinutes < endMinutes);
    });

    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, '0');
    const localDay = String(now.getDate()).padStart(2, '0');
    const localDateString = `${localYear}-${localMonth}-${localDay}`;

    if (AgendaTabla == "") {
      setErrorAll(true);
      return showAlert("error", "La tabla está vacía.");
    } else if (new Date(fecha).toISOString().split("T")[0] === localDateString && hourMinutes < currentTotalMinutes) {
      setErrorHora(true);
      return showAlert("error", "La hora seleccionada es menor a la hora actual.");
    } else if (horaOcupada) {
      setErrorHora(true);
      return showAlert("error", "Esa hora ya está ocupada para este barbero.");
    }

    const [horas, minutos] = hora.split(':').map(Number); // Convertir cada parte de la hora a número
    let nuevaHora = horas;
    let nuevoMinuto = minutos + 30;
    if (nuevoMinuto >= 60) {
      nuevaHora++;
      nuevoMinuto -= 60;
    }
    if (AgendaTabla.length > 1) {
      nuevoMinuto += 30;
      if (nuevoMinuto >= 60) {
        nuevaHora++;
        nuevoMinuto -= 60;
      }
    }
    nuevaHora = String(nuevaHora).padStart(2, '0');
    nuevoMinuto = String(nuevoMinuto).padStart(2, '0');
    const horaFin = `${nuevaHora}:${nuevoMinuto}:00`;

    showAlert("info", "Actualizando cita...");
    setLoading(true);
    setOpen(false);
    await Axios.put(URLAgenda, {
      IdAgenda: id,
      IdEmpleado: empleado,
      IdCliente: cliente,
      Estado: "Pendiente",
      FechaAgenda: fecha,
      HoraInicio: hora,
      HoraFin: horaFin,
      IdServicio: AgendaTabla.map(at => at.servicio),
      Valor: AgendaTabla.map(at => at.valor),
    }).then(() => {
      setTimeout(async () => {
        showAlert("success", "Agenda actualizada con éxito.");
        empty();
      }, 500);
    }).catch((error) => {
      showAlert("error", "Error al actualizar la agenda");
      console.error("Error al actualizar la agenda:", error);
    });
  };

  const NuevaAgenda = async (selectInfo) => {
    getServicios();
    getAgendaServicios();
    getClientes();
    getEmpleados();
    getUsuarios();
    await getAgenda();
    setOpen(true);
    if (selectInfo.startStr.includes('T')) {
      const parseDate = parseISO(selectInfo.startStr);
      const datePart = format(parseDate, 'yyyy-MM-dd');
      const timePart = format(parseDate, 'HH:mm:ss');
      setFecha(datePart);
      setHora(timePart);
      setSelectHora(HoursOptions.find(ho => ho.value === timePart))
    } else { setFecha(selectInfo.startStr) }
    if (userActive.IdRol == 2) {
      const emp = empleadosList.find(e => e.IdUsuario == userActive.IdUsuario);
      setEmpleado(emp?.IdEmpleado);
      setSelectBarbero({ value: emp?.IdEmpleado, label: userActive.Usuario });
    }
    if (userActive.IdRol == 3) {
      const cli = clientesList.find(c => c.IdUsuario == userActive.IdUsuario);
      setCliente(cli?.IdCliente);
      setSelectCliente({ value: cli?.IdCliente, label: userActive.Usuario });
    }
  };

  const EditarAgenda = async (clickInfo) => {
    setServCancelado(false);
    getServicios();
    getAgendaServicios();
    getClientes();
    getEmpleados();
    getUsuarios();
    await getAgenda();
    if (clickInfo.event._def.title === "Cancelado") {
      setServCancelado(true);
      showAlert("warning", "Esta cita está cancelada.", 2500);
    } else if (clickInfo.event._def.title === "Terminado") {
      setServCancelado(true);
      showAlert("warning", "Esta cita está Terminada.", 2500);
    }
    const findAgenda = agendaList.find(al => al.IdAgenda === parseInt(clickInfo.event._def.publicId));
    Edit(findAgenda)
    setOpen(true);
  };

  const formatNumber = (number) => {
    const parts = String(number).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
  };

  const handleEventDrop = (dropInfo) => {
    console.log('Evento arrastrado:', dropInfo.event.title, 'de', dropInfo.oldEvent.startStr, 'a', dropInfo.event.startStr);
    // Aquí puedes manejar la lógica para guardar el evento actualizado en la nueva fecha
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const citas = agendaList.map(al => ({
    id: al.IdAgenda,
    start: al.HoraInicio ? `${al.FechaAgenda}T${al.HoraInicio}` : "Cargando...",
    end: al.HoraFin ? `${al.FechaAgenda}T${al.HoraFin}` : "Cargando...",
    title: al.Estado
  }));

  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 1);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 16);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 15);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);

  function renderEventContent(eventInfo) {
    return (
      <div className="flex justify-between overflow-hidden text-ellipsis">
        {eventInfo ? <p className="flex gap-1">
          <b>{eventInfo.timeText}</b>
          <b className={`${eventInfo.event.title === "Pendiente" ? "text-blue-700" : eventInfo.event.title === "Terminado" ? "text-green-700" : "text-red-700"}`}>{eventInfo.event.title}</b>
        </p> : "Cargando..."}
      </div>
    )
  }

  const spanishDayNamesMonth = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const spanishDayNamesWeek = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  const [dayMaxEventRows, setDayMaxEventRows] = useState(2);
  const [viewType, setViewType] = useState('dayGridMonth');

  const handleViewChange = (view) => {
    setViewType(view.type);
    setDayMaxEventRows(view.type === "dayGridWeek" ? 25 : 2);
  };

  const getDayNames = (viewType) => {
    return viewType === "dayGridMonth" ? spanishDayNamesMonth : spanishDayNamesWeek;
  };

  const [userActive, setUserActive] = useState(null);
  useEffect(() => {
    const ua = usuariosList.find(u => u.IdUsuario == localStorage.getItem("idU"))
    if (usuariosList.length > 0 && localStorage.getItem("idU") && ua) {
      setUserActive(ua)
    }
  }, [usuariosList, localStorage.getItem("idU")], userActive);

  if ((userActive === null)) {
    return (
      <div>
        <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
          style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div>
      </div>);
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {loading ? <div className="h-full w-full left-0 top-0 fixed z-50 grid content-center justify-center items-center bg-[rgba(0,0,0,0.3)] text-4xl"
        style={{ WebkitTextStroke: "1px white" }}><img src="/public/img/logo-login-black.png" alt="Cargando..." className="h-[300px]" /><span className="h-full flex justify-center pt-5 font-bold">Cargando...</span></div> : null}
      <Card>
        <CardHeader variant="gradient" className="mb-4 cardHeadCol">
          <Typography variant="h6" color="white" className="flex justify-between items-center">
            Agenda de citas
          </Typography>
        </CardHeader>
        <CardBody>
          <div>
            <FullCalendar
              height={750}
              // contentHeight={600}
              // aspectRatio={2}
              headerToolbar={{
                left: 'title',
                center: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek',
                right: 'prev today next',
              }}
              buttonText={{
                prev: '',
                next: '',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista',
                dayGridMonth: 'Mes',
                timeGridWeek: 'Semana',
                timeGridDay: 'Día'
              }}
              plugins={[listPlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
              // eventMinHeight={2} //la altura mínima que se permite que tenga un evento.
              initialView={viewType}
              validRange={{ start: startDate, end: endDate }}
              selectConstraint={{ start: minDate, end: maxDate }}
              dayMaxEventRows={dayMaxEventRows}
              viewDidMount={(info) => handleViewChange(info.view)} // Se llama cuando se monta la vista inicial
              datesSet={(info) => handleViewChange(info.view)}
              selectable={true}
              select={NuevaAgenda}
              eventClick={EditarAgenda}
              eventDrop={handleEventDrop}
              editable={false}
              locales={[esLocale]}
              locale="es"
              slotMinTime="08:00:00"
              slotMaxTime="19:30:00"
              dayHeaderContent={(arg) => {
                const dayNames = getDayNames(viewType);
                const dayText = dayNames[arg.date.getDay()];
                return dayText;
              }}
              events={citas}
              eventContent={renderEventContent} />
          </div>
        </CardBody>
      </Card>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={showAlertWarning} >
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
                <form className={`${{/*sm:flex-row-reverse*/ }} flex absolute top-[15%] gap-5`} >
                  <Card className={`col-span-2 ${!servCancelado ? "h-[290px]" : "h-[180px]"} w-[500px]`}>
                    <CardHeader variant="gradient" className="mb-4 cardHeadCol">
                      <Typography variant="h6" color="white" className="flex justify-between items-center">
                        {edit ? "Editar agenda" : "Agendamiento"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="pt-0 pb-5">
                      <div className={`gap-3 grid grid-cols-2`}>
                        <div className={`${errorAll || errorEmpleado ? "divError" : ""} mt-3`}>
                          <Select
                            className={`${errorAll || errorEmpleado ? "error" : ""} text-gray-600 w-full`}
                            placeholder="Seleccione un barbero"
                            isSearchable
                            value={selectBarbero}
                            options={BarberoOptions}
                            isDisabled={(edit ? servCancelado : bloquear) || userActive.IdRol == 2 ? true : false}
                            onChange={async (selBarb) => {
                              setSelectBarbero(selBarb);
                              setEmpleado(selBarb.value);
                            }} />
                        </div>
                        <div className={`${errorAll || errorCliente ? "divError" : ""} mt-3`}>
                          <Select
                            className={`${errorAll || errorCliente ? "error" : ""} text-gray-600 w-full`}
                            placeholder="Seleccione un cliente"
                            isSearchable
                            value={selectCliente}
                            options={ClienteOptions}
                            isDisabled={(edit ? servCancelado : bloquear) || userActive.IdRol == 3 ? true : false}
                            onChange={async (selCli) => {
                              setSelectCliente(selCli);
                              setCliente(selCli.value);
                            }} />
                        </div>
                        <div className={`${errorAll || errorFecha ? "divError" : ""} mt-3`}>
                          {!edit ?
                            <Input
                              className={`${errorAll || errorFecha ? "error errorEmpty" : ""} text-gray-600 w-full`}
                              label="Seleccione una fecha"
                              readOnly={true}
                              value={fecha} />
                            :
                            <Input
                              className={`${errorAll || errorFecha ? "error errorEmpty" : ""}`}
                              label="Fecha de Registro"
                              value={fecha}
                              type="date"
                              min={fechaActual}
                              max={fechaMaximaFormateada}
                              readOnly={edit ? servCancelado : bloquear}
                              onChange={(event) => {
                                setFecha(event.target.value)
                              }} />}
                        </div>
                        <div className={`${errorAll || errorHora ? "divError" : ""} mt-3`}>
                          <Select
                            className={`${errorAll || errorHora ? "error" : ""} text-gray-600 w-full`}
                            placeholder="Seleccione una hora"
                            isSearchable
                            value={selectHora}
                            options={HoursOptions}
                            isDisabled={edit ? servCancelado : bloquear}
                            onChange={async (selHour) => {
                              setSelectHora(selHour);
                              setHora(selHour.value);
                            }} />
                        </div>
                        {!servCancelado ?
                          <div className="grid grid-cols-2 col-span-2 gap-3">
                            <div className={`${errorAll || errorServicio ? "divError" : ""} mt-3`}>
                              <Select
                                className={`${errorAll || errorServicio ? "error" : ""} text-gray-600 w-full`}
                                placeholder="Seleccione un servicio"
                                isSearchable
                                value={selectServicio}
                                options={servicioOptions}
                                onChange={async (selServ) => {
                                  setSelectServicio(selServ);
                                  setServicio(selServ.value);
                                  setValor(serviciosList.filter(s => s.IdServicio === selServ.value).map(s => s.Precio));
                                }} />
                            </div>
                            <div className={`${errorAll || errorValor ? "divError" : ""} mt-3`}>
                              <Input
                                className={`${errorAll || errorValor ? "error" : ""} text-gray-600 w-full`}
                                label="Valor"
                                readOnly={true}
                                value={`$${formatNumber(valor)}`} />
                            </div>
                          </div>
                          : null}
                      </div>
                      {!servCancelado ? <div className="flex justify-center items-center mt-3">
                        {edit ?
                          [<Button className="btnGreen py-3 px-4 flex items-center" key={1} onClick={() => { agregarVentaATabla() }}>Agregar</Button>,
                          <Button className="ms-5 btnRed py-3 px-4 flex items-center" key={2} onClick={() => { cancelarCita() }}>Cancelar cita</Button>]
                          :
                          <Button className="btnGreen py-3 px-4 flex items-center" onClick={() => { agregarVentaATabla() }}>Agregar</Button>
                        }
                      </div> : null}
                    </CardBody>
                  </Card>
                  <Card className="col-span-2">
                    <CardHeader variant="gradient" className="mb-4 cardHeadCol">
                      <Typography variant="h6" color="white" className="flex justify-between items-center">
                        Servicios agregados
                      </Typography>
                    </CardHeader>
                    <CardBody className="pt-0 pb-5 flex">
                      <div className="pl-2">
                        <table className="w-full min-w-[640px] table-auto min-h-[169px]">
                          <thead>
                            {!servCancelado ?
                              <tr>
                                {["servicio", "Precio", "Borrar"].map((el) => (
                                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                    <Typography
                                      variant="small"
                                      className="text-[13px] font-bold uppercase text-blue-gray-400">
                                      {el}
                                    </Typography>
                                  </th>
                                ))}
                              </tr> :
                              <tr>
                                {["servicio", "Precio"].map((el) => (
                                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                                    <Typography
                                      variant="small"
                                      className="text-[13px] font-bold uppercase text-blue-gray-400">
                                      {el}
                                    </Typography>
                                  </th>
                                ))}
                              </tr>
                            }
                          </thead>
                          <tbody id="IdBodyTable" className="align-top">
                            {AgendaTabla.length > 0 ? (
                              AgendaTabla.map((venta, index) => (
                                !servCancelado ? (
                                  <tr key={index} className="border-b">
                                    <td className="w-52 px-6 py-4 text-sm text-gray-900">
                                      {serviciosList.find(sl => sl.IdServicio === venta.servicio)?.NombreDelServicio}
                                    </td>
                                    <td className="w-32 px-6 py-4 text-sm text-gray-900">
                                      ${formatNumber(venta.valor)}
                                    </td>
                                    <td className="w-28 px-6 py-4 text-left text-sm font-medium">
                                      <button type="button" onClick={() => delServ(venta)} className="text-xs font-semibold btnFunciones btnRed">
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={index} className="border-b">
                                    <td className="w-52 px-6 py-4 text-sm text-gray-900">
                                      {serviciosList.find(sl => sl.IdServicio === venta.servicio)?.NombreDelServicio}
                                    </td>
                                    <td className="w-32 px-6 py-4 text-sm text-gray-900">
                                      ${formatNumber(venta.valor)}
                                    </td>
                                  </tr>
                                )
                              ))
                            ) : (
                              <tr key="1" className="border-b text-left">
                                <td className="w-52 px-6 py-4 text-sm text-gray-900"></td>
                                <td className="w-52 pl-14 pt-12 text-sm text-gray-900">
                                  Tabla vacía...
                                </td>
                                <td className="w-52 px-6 py-4 text-sm text-gray-900"></td>
                              </tr>
                            )}
                          </tbody>

                        </table>
                        <div className="pt-4 grid grid-cols-2 gap-5">
                          {!servCancelado ? <div className="flex justify-end items-center col-span-1">
                            {edit ?
                              <Button className="btnOrange py-3 px-4 flex items-center" onClick={() => { putAgenda() }}>Editar cita</Button>
                              :
                              <Button className="btnGreen py-3 px-4 flex items-center" onClick={() => { postAgenda() }}>Agendar cita</Button>
                            }
                          </div> : null}
                          <div className="flex justify-start items-center col-span-1">
                            {!servCancelado ? <Button className="btnRed py-3 px-4 flex items-center" onClick={() => { showAlertWarning() }}>Cancelar</Button> : <Button className="btnGray py-3 px-4 flex items-center" onClick={() => {
                              setLoading(true);
                              setOpen(false);
                              setTimeout(() => {
                                empty()
                              }, 500);
                            }}>Volver</Button>}
                          </div>
                          <div className="absolute right-16"><strong>Total: </strong>${formatNumber(precioTotal)}</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </form>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div >
  );
}
export default Agenda;