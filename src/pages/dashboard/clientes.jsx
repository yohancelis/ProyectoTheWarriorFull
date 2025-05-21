import React, { Fragment, useRef, useState, useEffect } from "react";
import {
  Typography, Card, CardHeader, CardBody, IconButton,
  Menu, MenuHandler, MenuList, MenuItem, Avatar,
  Tooltip, Progress, Input, Button
} from "@material-tailwind/react";
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import Swal from 'sweetalert2';
import {
  PencilSquareIcon,
  TrashIcon, UserPlusIcon
} from "@heroicons/react/24/solid";
import {
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { number } from "prop-types";

export function Clientes() {

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

  const [clientesList, setClientesL] = useState([]);
  const [usuariosList, setUsuariosL] = useState([]);
  const [usuariosClientesList, setUsuariosClientesList] = useState([]);

  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [errorAll, setErrorAll] = useState(false);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorApellidos, setErrorApellidos] = useState(false);
  const [errorCelular, setErrorCelular] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(false);
  const [errorPass, setErrorPass] = useState(false);
  const [errorConfirmPass, setErrorConfirmPass] = useState(false);

  const [id, setId] = useState(0);
  const [edit, setEdit] = useState(false);

  const [open, setOpen] = useState(false);
  const [ver, setVer] = useState(true);

  const [loading, setLoading] = useState(false);

  const empty = async () => {
    await getClientes();
    setOpen(false);
    getUsuarios();
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    setUsuario("");
    setNombre("");
    setApellidos("");
    setCelular("");
    setCorreo("");
    setPass("");
    setConfirmPass("");
    setVer(true);
    setEdit(false);
    setLoading(false);
  };

  const URLClientes = "http://localhost:8080/api/clientes";
  const URLUsuarios = "http://localhost:8080/api/usuarios";

  const getUsuarios = async () => {
    try {
      setLoading(true);
      const resp = await Axios.get(URLUsuarios);
      setUsuariosL(resp.data.usuarios);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
    getClientes();
  };

  const getClientes = async () => {
    try {
      const resp = await Axios.get(URLClientes);
      setClientesL(resp.data.clientes);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  useEffect(() => {
    getClientes();
    getUsuarios();
  }, []);

  const postUsuario = async () => {
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,20}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    if (!usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      setErrorAll(true);
    } else if (!usuario) {
      showAlert("error", "Ingrese un nombre de usuario.");
      setErrorUsuario(true);
    } else if (usuario != usuario.match(valUsu)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario).includes(usuario) && usuario !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Usuario).toString()) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Ingrese su nombre.");
      setErrorNombre(true);
    } else if (nombre != nombre.match(valNomApe)) {
      showAlert("error", "Ingrese un nombre válido.");
      setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Ingrese sus apellidos.");
      setErrorApellidos(true);
    } else if (apellidos != apellidos.match(valNomApe)) {
      showAlert("error", "Ingrese apellidos válido.");
      setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Ingrese su número de celular.");
      setErrorCelular(true);
    } else if (celular != celular.match(valCel)) {
      showAlert("error", "Ingrese un número de celular válido.");
      setErrorCelular(true);
    } else if (usuariosList.map((user) => user.Celular).includes(celular) && celular !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Celular).toString()) {
      showAlert("error", "Ese número de celular ya está registrado...");
      setErrorCelular(true);
    } else if (!correo) {
      showAlert("error", "Ingrese un correo.");
      setErrorCorreo(true);
    } else if (correo != correo.match(valEm)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else if (usuariosList.map((user) => user.Correo).includes(correo) && correo !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Correo).toString()) {
      showAlert("error", "Ese correo ya está registrado...");
      setErrorCorreo(true);
    } else if (!pass) {
      showAlert("error", "Ingrese una contraseña.");
      setErrorPass(true);
    } else if (pass != pass.match(valPa)) {
      showAlert("error", "Ingrese una contraseña válida.");
      setErrorPass(true);
    } else if (confirmPass != pass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      setErrorConfirmPass(true);
    } else {
      showAlert("info", "Cliente registrado con éxito.");
      setOpen(false);
      setLoading(true);
      await Axios.post(URLUsuarios, {
        IdRol: 3,
        Usuario: usuario,
        Estado: true,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: parseInt(celular),
        Correo: correo,
        Pass: pass,
      }).then(async () => {
        setTimeout(async () => {
          showAlert("success", "Cliente registrado con éxito.");
          empty();
        }, 500);
      }).catch((error) => {
        showAlert("error", "error al crear el usuario");
        console.error("Error al crear el usuario:", error);
      });
    }
  }

  const putUsuario = async () => {
    const valUsu = /^(?=.*[A-Z])[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{3,20}$/;
    const valNomApe = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]{3,20}$/;
    const valCel = /^(?=.*\d)[0-9]{10}$/;
    const valEm = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]+@[a-zA-Z]{4,8}\.[a-zA-Z]{2,4}$/;
    const valPa = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ.,/*-_=+]{8,30}$/;
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    if (!usuario && !nombre && !apellidos && !celular && !correo && !pass && !confirmPass) {
      showAlert("error", "Complete primero los campos.");
      setErrorAll(true);
    } else if (!usuario) {
      showAlert("error", "Ingrese un nombre de usuario.");
      setErrorUsuario(true);
    } else if (usuario != usuario.match(valUsu)) {
      showAlert("error", "Ingrese un nombre de usuario válido.");
      setErrorUsuario(true);
    } else if (usuariosList.map((user) => user.Usuario).includes(usuario) && usuario !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Usuario).toString()) {
      showAlert("error", "Ese nombre de usuario ya está registrado...");
      setErrorUsuario(true);
    } else if (!nombre) {
      showAlert("error", "Ingrese su nombre.");
      setErrorNombre(true);
    } else if (nombre != nombre.match(valNomApe)) {
      showAlert("error", "Ingrese un nombre válido.");
      setErrorNombre(true);
    } else if (!apellidos) {
      showAlert("error", "Ingrese sus apellidos.");
      setErrorApellidos(true);
    } else if (apellidos != apellidos.match(valNomApe)) {
      showAlert("error", "Ingrese apellidos válido.");
      setErrorApellidos(true);
    } else if (!celular) {
      showAlert("error", "Ingrese su número de celular.");
      setErrorCelular(true);
    } else if (celular != celular.match(valCel)) {
      showAlert("error", "Ingrese un número de celular válido.");
      setErrorCelular(true);
    } else if (usuariosList.map((user) => user.Celular).includes(celular) && celular !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Celular).toString()) {
      showAlert("error", "Ese número de celular ya está registrado...");
      setErrorCelular(true);
    } else if (!correo) {
      showAlert("error", "Ingrese un correo.");
      setErrorCorreo(true);
    } else if (correo != correo.match(valEm)) {
      showAlert("error", "Ingrese un correo válido.");
      setErrorCorreo(true);
    } else if (usuariosList.map((user) => user.Correo).includes(correo) && correo !== usuariosList.filter(user => user.IdUsuario == id).map(user => user.Correo).toString()) {
      showAlert("error", "Ese correo ya está registrado...");
      setErrorCorreo(true);
    } else if (pass != pass.match(valPa) && pass != "") {
      showAlert("error", "Ingrese una contraseña válida.");
      setErrorPass(true);
    } else if (confirmPass != pass) {
      showAlert("error", "Las contraseñas deben ser iguales.");
      setErrorPass(true);
      setErrorConfirmPass(true);
    } else {
      showAlert("info", "Actualizando información de cliente.");
      setOpen(false);
      setLoading(true);
      await Axios.put(URLUsuarios, {
        IdUsuario: id,
        IdRol: 3,
        Usuario: usuario,
        Estado: true,
        Nombre: nombre,
        Apellidos: apellidos,
        Celular: celular,
        Correo: correo,
        Pass: pass,
      })
        .then(async () => {
          const existeCliente = parseInt(clientesList.filter(client => client.IdUsuario == id).map(client => client.IdCliente));
          await Axios.put(URLClientes, {
            IdUsuario: id,
            IdCliente: existeCliente,
          }).then(() => {
            setTimeout(async () => {
              showAlert("success", "Cliente actualizado con éxito.");
              empty();
            }, 500);
          }).catch((error) => {
            showAlert("error", "Error al enviar el cliente");
            console.error("Error al enviar el cliente:", error);
          });
        })
        .catch((error) => {
          showAlert("error", "error al actualizar el usuario");
          console.error("Error al actualizar el usuario:", error);
        });
    }
  }

  const Edit = (val) => {
    setEdit(true);
    setErrorAll(false);
    setErrorUsuario(false);
    setErrorNombre(false);
    setErrorApellidos(false);
    setErrorCelular(false);
    setErrorCorreo(false);
    setErrorPass(false);
    setErrorConfirmPass(false);
    setId(val.IdUsuario)
    setUsuario(usuariosList.filter(user => user.IdUsuario == val.IdUsuario).map(user => user.Usuario).toString());
    setNombre(usuariosList.filter(user => user.IdUsuario == val.IdUsuario).map(user => user.Nombre).toString());
    setApellidos(usuariosList.filter(user => user.IdUsuario == val.IdUsuario).map(user => user.Apellidos).toString());
    setCorreo(usuariosList.filter(user => user.IdUsuario == val.IdUsuario).map(user => user.Correo).toString());
    setCelular(usuariosList.filter(user => user.IdUsuario == val.IdUsuario).map(user => user.Celular).toString());
  };

  const toggleVer = () => {
    setVer(!ver)
  }

  //Cambiar estado
  const switchEstado = (id) => {
    if (usuariosList.some((user) => (user.IdUsuario === id && user.IdUsuario === 1))) {
      showAlert("error", "Este usuario no se puede desactivar.");
      return;
    }
    let est = usuariosList.some((user) => (user.IdUsuario === id && user.Estado))
    if (est) {
      est = false;
    } else {
      est = true;
    }
    const user = usuariosList.find((user) => (user.IdUsuario === id))
    try {
      Axios.put(URLUsuarios + `/${id}`, {
        IdUsuario: id,
        Estado: est,
      }).then(() => {
        showAlert("success", "Cambiando estado...");
        setTimeout(() => {
          showAlert("success", "Estado modificado.");
          getUsuarios();
          getClientes();
        }, 500);
      })
    } catch (error) {
      showAlert("error", "Error al modificar el estado.");
      console.log("Error al modificar el estado: ", error);
    }
  };

  const userCel = (id) => {
    const user = usuariosList.find((usuario) => usuario.IdUsuario === id)?.Celular
    const userFormat = user ? formatNumCel(user.toString()) : user;
    return userFormat;
  }

  function formatNumCel(number) {
    const fstSegment = number.substring(0, 3);
    const sndSegment = number.substring(3, 6);
    const trdSegment = number.substring(6, 10);
    const formatCel = `(${fstSegment}) ${sndSegment}-${trdSegment}`;
    return formatCel;
  }

  //Para cargar los get
  useEffect(() => {
    if (usuariosList.length > 0 && clientesList.length > 0) {
      usuariosClientes();
    }
  }, [usuariosList, clientesList]);

  const usuariosClientes = async () => {
    const client = clientesList.map(c => {
      const aUsuariosRoles = usuariosList.find(u => u.IdUsuario === c.IdUsuario);
      return {
        IdUsuario: aUsuariosRoles.IdUsuario,
        usuario: aUsuariosRoles.Usuario,
        estado: aUsuariosRoles.Estado ? "Activo" : "Inactivo",
        nombre: aUsuariosRoles.Nombre,
        apellido: aUsuariosRoles.Apellidos,
        celular: aUsuariosRoles.Celular,
        correo: aUsuariosRoles.Correo
      };
    })
    setUsuariosClientesList(client);
  };

  const [searchTerm, setSearchTerm] = useState("");
  // Estados para el paginado
  const [currentPage, setCurrentPage] = useState(1);
  const [elementos] = useState(5); // Número de elementos por página

  // Filtrar valores según el término de búsqueda
  const filteredElements = usuariosClientesList.filter((user) => {
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
                  <Card className="formRegUsu" style={{ zIndex: edit ? 50 : 500 }}>
                    <CardHeader variant="gradient" className="mb-8 p-6 cardHeadCol">
                      <Typography variant="h6" color="white" className="text-left">
                        {edit ? "Editar cliente" : "Crear cliente"}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-2 pt-0 pb-2">
                      <form onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.nodeName !== 'TEXTAREA' && e.target.type !== 'submit') {
                          e.preventDefault();
                          if (edit) {
                            putUsuario();
                          } else {
                            postUsuario();
                          }
                        } else if (e.key === "Escape" && e.target.nodeName !== 'TEXTAREA') {
                          empty()
                        }
                      }}>
                        <div className="grid grid-cols-2 gap-3 me-5 ms-5">
                          <div className={`${errorUsuario || errorAll ? "divError" : ""} col-span-2`}>
                            <Input
                              className={`${errorUsuario || errorAll ? "error" : ""}`}
                              label="Usuario"
                              value={usuario}
                              onChange={(event) => setUsuario(event.target.value)} />
                            <span className={`${errorAll || errorUsuario ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe tener de 3 a 20 caracteres y al menos una mayúscula.</span>
                          </div>
                          <div className={`${errorNombre || errorAll ? "divError" : ""} col-span-1`}>
                            <Input
                              className={`${errorNombre || errorAll ? "error" : ""}`}
                              label="Nombre"
                              value={nombre}
                              onChange={(event) => setNombre(event.target.value)} />
                          </div>
                          <div className={`${errorApellidos || errorAll ? "divError" : ""} col-span-1`}>
                            <Input
                              className={`${errorApellidos || errorAll ? "error" : ""}`}
                              label="Apellido"
                              value={apellidos}
                              onChange={(event) => setApellidos(event.target.value)} />
                          </div>
                          <div>
                            <div className={`${errorCelular || errorAll || celular.length > 10 ? "divError" : ""} flex items-center relative col-span-1`}>
                              <Input
                                className={`${errorCelular || errorAll || celular.length > 10 ? "error" : ""} pr-[60px]`}
                                label="Celular"
                                value={celular}
                                onChange={(event) => setCelular(event.target.value)}
                                type="number" />
                              <span className={`${errorCelular || errorAll || celular.length > 10 ? "text-[rgb(240,0,0)!important]" : ""} absolute right-3 text-black`}>{celular.length}/10</span>
                            </div>
                            <span className={`${errorAll || errorCelular ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe ser un número de 10 dígitos.</span>
                          </div>
                          <div className={`${errorCorreo || errorAll ? "divError" : ""} col-span-1`}>
                            <Input
                              className={`${errorCorreo || errorAll ? "error" : ""}`}
                              label="Correo"
                              value={correo}
                              onChange={(event) => setCorreo(event.target.value)}
                              type="email" />
                            <span className={`${errorAll || errorCorreo ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Ejemplo@gmail.com</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 mx-5">
                          <div>
                            <div className={`${pass.length > 30 || errorPass || errorAll ? "divError" : ""} col-span-1 flex items-center relative`}>
                              <Input
                                className={`${pass.length > 99 ? "pr-[95px]" : "pr-[85px]"} ${pass.length > 30 || errorPass || errorAll ? "error" : ""}`}
                                label="Contraseña"
                                value={pass}
                                onChange={(event) => setPass(event.target.value)}
                                type={ver ? "password" : "text"} />
                              <span className={`${pass.length > 30 || errorPass || errorAll ? "text-[rgb(240,0,0)!important]" : ""} absolute right-10 text-black`}>{pass.length}/30</span>
                              <button
                                type="button"
                                className={`${errorAll || errorPass ? "error" : ""} ml-2 text-black absolute right-3 `}
                                onClick={toggleVer}>
                                {ver ? <EyeIcon className="h-5" /> : <EyeSlashIcon className="h-5" />}
                              </button>
                            </div>
                            <span className={`${errorAll || errorPass ? "text-[rgb(255,0,0)]" : "text-gray-700 "} line-clamp-none text-left text-xs pl-1 mt-1`}>Debe tener de 8 a 30 caracteres, al menos una mayúscula y un número.</span>
                          </div>
                          <div className={`${errorAll || errorConfirmPass ? "divError" : ""} col-span-1`}>
                            <Input
                              className={`${errorAll || errorConfirmPass ? "error" : ""}`}
                              label="Confirmar contraseña"
                              value={confirmPass}
                              onChange={(event) => setConfirmPass(event.target.value)}
                              type={ver ? "password" : "text"} />
                          </div>
                        </div>
                        <div className="flex justify-center items-center mt-3">
                          <div>
                            {edit ?
                              <Button
                                onClick={(e) => { putUsuario(); }}
                                className="btnOrange text-white font-bold py-2 px-4 rounded me-5">
                                Editar cliente
                              </Button> :
                              <Button
                                onClick={(e) => { postUsuario(); }}
                                className="btnGreen text-white font-bold py-2 px-4 rounded me-5" >
                                Crear cliente
                              </Button>
                            }
                            <Button onClick={(e) => {
                              setOpen(false);
                              setLoading(true)
                              setTimeout(() => {
                                empty();
                              }, 500);
                            }} className="btnRed text-white font-bold py-2 px-4 rounded">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </form>
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
            Clientes <Button className="btnRed px-3 py-2 flex items-center border" onClick={() => { setOpen(true), setEdit(false); }}><UserPlusIcon className="h-6 w-6 me-2" />Nuevo cliente</Button>
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-0 pb-5">
          <div className="my-2 grid grid-cols-6">
            <div className="col-start-5 col-span-2">
              <Input label="Buscar" value={searchTerm}
                onChange={(e) => (setSearchTerm(e.target.value), setCurrentPage(1))} />
            </div>
          </div>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Usuario", "Estado", "Nombre", "Apellido", "Celular", "Correo", "Editar"].map((el) => (
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
              {currentPag.map((cliente) => (
                <tr key={cliente.IdUsuario} id={`User${cliente.IdUsuario}`}>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{usuariosList.find((usuario) => usuario.IdUsuario === cliente.IdUsuario)?.Usuario}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {usuariosList.find((usuario) => usuario.IdUsuario === cliente.IdUsuario)?.Estado ? (
                      <Button onClick={() => {
                        switchEstado(cliente.IdUsuario)
                      }} className="btnGreen text-white font-bold py-2 px-4 rounded-full">
                        Activo
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        switchEstado(cliente.IdUsuario)
                      }} className="btnRed text-white font-bold py-2 px-4 rounded-full">
                        Inactivo
                      </Button>
                    )}
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{usuariosList.find((usuario) => usuario.IdUsuario === cliente.IdUsuario)?.Nombre}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{usuariosList.find((usuario) => usuario.IdUsuario === cliente.IdUsuario)?.Apellidos}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{userCel(cliente.IdUsuario)}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">{usuariosList.find((usuario) => usuario.IdUsuario === cliente.IdUsuario)?.Correo}</td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Button
                      onClick={() => { Edit(cliente), setOpen(true) }}
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
export default Clientes;