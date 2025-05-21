import { Routes, Route, Navigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import { Sidenav, DashboardNavbar, Configurator, Footer } from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Axios from "axios";
import Agenda from "@/pages/dashboard/agenda"

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;


  const [user, setUser] = useState("");

  const [rolesList, setRolesL] = useState([]);
  const [permisosList, setPermisosL] = useState([]);
  const [rolesxPermisosList, setRolesxPermisosL] = useState([]);

  const URLRols = "http://localhost:8080/api/roles";
  const URLUsuarios = "http://localhost:8080/api/usuarios";
  const URLPerms = "http://localhost:8080/api/permisos";
  const URLRolsxPerms = "http://localhost:8080/api/rolesxpermisos";

  const getRoles = async () => {
    try {
      const resp = await Axios.get(URLRols);
      setRolesL(resp.data.roles);
    } catch (error) {
      console.error("Error al obtener datos de los roles: ", error);
    }
  };

  const getPerms = async () => {
    try {
      const resp = await Axios.get(URLPerms);
      setPermisosL(resp.data.permisos);
    } catch (error) {
      console.error("Error al obtener datos de los permisos: ", error);
    }
  };

  const getRolsxPerms = async () => {
    try {
      const resp = await Axios.get(URLRolsxPerms);
      setRolesxPermisosL(resp.data.rolesxpermisos);
    } catch (error) {
      console.error("Error al obtener datos de los roles x permisos: ", error);
    }
  };

  const getUsuarioID = async () => {
    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    try {
      const resp = await Axios.get(URLUsuarios + `/${decodedToken.uid}`);
      setUser(resp.data.usuario);
    } catch (error) {
      console.error("Error al obtener datos de los usuarios:", error);
    }
  };

  useEffect(() => {
    getPerms();
    getRolsxPerms();
    getUsuarioID();
    const intervalId = setInterval(async () => {
      // console.log("Cargando datos...")
      await getRoles();
      // console.log("Datos cargados.")
    }, 180000);
    checkPermission()
    return () => clearInterval(intervalId);
  }, []);

  const permisosId = rolesxPermisosList.filter(rxp => rxp.IdRol === user.IdRol).map(rxp => rxp.IdPermiso);

  const checkPermission = (name) => {
    return permisosId.some(id => {
      const perms = permisosList.find(pl => pl.IdPermiso == id)?.NombreDelPermiso;
      let otherNames = [];
      if (perms === "Gestión de ventas") {
        otherNames = otherNames.concat("Ventas");
      }
      if (perms === "Configuración") {
        otherNames = otherNames.concat("Roles");
      }
      if (perms === "Insumos") {
        otherNames = otherNames.concat("Compras");
      }
      if (perms === "Agendamiento") {
        otherNames = otherNames.concat("Servicios");
      }
      if (perms === "Gestión de gastos operativos") {
        otherNames = otherNames.concat("Conceptos gastos");
        otherNames = otherNames.concat("Gastos operativos");
      }
      return perms === name || otherNames.includes(name);
    });
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        {/* <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton> */}
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                // console.log(""),
                // pages.filter(p => console.log(p.name)),
                // console.log(pages),
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
