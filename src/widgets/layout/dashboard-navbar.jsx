import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar, Typography, Button, IconButton, Breadcrumbs,
  Input, Menu, MenuHandler, MenuList, MenuItem,
  Avatar, Switch
} from "@material-tailwind/react";
import { UserCircleIcon, UserIcon, Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import {
  useMaterialTailwindController, setOpenConfigurator, setOpenSidenav, setFixedNavbar,
} from "@/context";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../pages/dashboard/authContext";
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Axios from "axios";

export function DashboardNavbar() {

  const navigate = useNavigate();

  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;

  const { logout } = useAuth();
  const [user, setUser] = useState("");
  const [timeSesion, setTimeSesion] = useState("");

  const token = localStorage.getItem('token');

  const [hora, setHora] = useState(new Date());
  useEffect(() => {
    const decodedToken = jwtDecode(token);
    const intervalId = setInterval(() => {
      setHora(new Date());
      const remainingTime = decodedToken.exp - (Date.now() / 1000);
      setTimeSesion(remainingTime);
    }, 1000); // Actualiza la hora cada segundo
    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, []); // Se ejecuta solo una vez al montar el componente
  // Formatea la hora en formato hh:mm:ss
  const horaFormateada = hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const sesionHours = Math.floor(timeSesion / 3600);
  const sesionMinutes = Math.floor((timeSesion % 3600) / 60);
  const sesionSeconds = Math.floor(timeSesion % 60);
  const caducaSesion = new Date(1970, 0, 1, sesionHours, sesionMinutes, sesionSeconds);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      Axios.get("https://http://localhost:8080//api/usuarios" + `/${decodedToken.uid}`)
        .then((response) => {
          setUser(response.data.usuario);
        })
    } else {
      return console.log("no existe un token.");
    }
  }, [token])

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

  const handleLogout = () => {
    Swal.fire({
      title: "¿Desea salir?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonColor: "rgb(200,40,20)",
      confirmButtonText: "Si",
      cancelButtonColor: "rgb(40,150,20)",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        showAlert("success", "Sesión finalizada.");
        logout();
        navigate('/auth/sign-in');
      }
    });
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
        : "px-0 py-1"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize flex items-center">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden me-10"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-7 w-7 text-black" />
          </IconButton>
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""
              }`}
          >
            <p><strong>Hora: </strong>{horaFormateada}</p>
            <p><strong>Sesión: </strong>{timeSesion ? caducaSesion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Cargando..."}</p>
          </Breadcrumbs>
        </div>
        <div className="flex items-center">
          <Menu>
            <MenuHandler>
              <Button variant="text" color="blue-gray" className="p-3 flex items-center normal-case">
                <UserCircleIcon className={`h-7 w-7 ${user.IdRol === 1 ? "text-[rgb(150,0,0)]" : "text-gray-800"} me-2`} />
                <Typography className={`${user.IdRol === 1 ? "text-[rgb(150,0,0)]" : "text-gray-800"} font-bold`}
                  style={user.IdRol === 1 ? { WebkitTextStroke: "0.3px black" } : null}>
                  {user.Usuario ? user.Usuario : "Cargando..."}
                </Typography>
              </Button>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <Link to="/dashboard/profile">
                <MenuItem className="flex items-center gap-2">
                  <UserIcon
                    className="h-7 w-h-7 text-blue-gray-800"
                    alt="item-1"
                    size="sm"
                    variant="circular"
                  />
                  <div>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-900"
                    >
                      Perfil
                    </Typography>
                  </div>
                </MenuItem>
              </Link>
              <hr />
              <MenuItem className="flex items-center p-0">
                <div className="w-full ps-2 flex items-center">
                  <div className="flex items-center w-[50px] justify-center">
                    <Switch
                      alt="item-2"
                      size="sm"
                      id="navbar-fixed"
                      checked={fixedNavbar}
                      onChange={() => setFixedNavbar(dispatch, !fixedNavbar)} />
                  </div>
                  <Typography
                    variant="small"
                    className="font-bold text-blue-gray-900 ps-2 py-3 w-full"
                    onClick={() => setFixedNavbar(dispatch, !fixedNavbar)}>
                    Fijar barra
                  </Typography>
                </div>
              </MenuItem>
              <hr />
              <Link onClick={() => handleLogout()}>
                <MenuItem className="flex items-center gap-2">
                  <ArrowRightStartOnRectangleIcon
                    className="h-7 w-h-7 text-blue-gray-900"
                    alt="item-3"
                    size="sm"
                    variant="circular" />
                  <div>
                    <Typography
                      variant="small"
                      color="black"
                      className="font-normal flex justify-center" >
                      Salir
                    </Typography>
                  </div>
                </MenuItem>
              </Link>
              {/* <MenuItem className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem> */}
            </MenuList>
          </Menu>
          {/* <IconButton
            variant="text"
            color="red"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-7 w-7 text-black" />
          </IconButton> */}
        </div>
      </div>
    </Navbar >
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
