import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography, } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import Axios from "axios";
export function Sidenav({ brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const [user, setUser] = useState("");

  const [permisosList, setPermisosL] = useState([]);
  const [rolesxPermisosList, setRolesxPermisosL] = useState([]);

  const URLUsuarios = "https://http://localhost:8080//api/usuarios";
  const URLPerms = "https://http://localhost:8080//api/permisos";
  const URLRolsxPerms = "https://http://localhost:8080//api/rolesxpermisos";

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

  const permisosId = rolesxPermisosList.filter(rxp => rxp.IdRol === user.IdRol).map(rxp => rxp.IdPermiso)
  useEffect(() => {
    getPerms();
    getRolsxPerms();
    getUsuarioID();
  }, []);

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } overflow-y-auto fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}>
      <div
        className={`relative`}>
        <div className="py-3 px-10 text-center cursor-default select-none">
          <Typography
            variant="h6">
            {sidenavType === "dark" ?
              <img
                src="/img/logo-twbs-blanco.png"
                className="h-full w-full object-cover rounded-3xl  lg:w" /> :
              <img
                src="/img/logo-twbs-negro.png"
                className="h-full w-full object-cover rounded-3xl  lg:w" />}
          </Typography>
        </div>
        <IconButton
          variant="text"
          ripple={false}
          className={`absolute h-7 w-7 right-[5px] top-0 mt-1 rounded-md xl:hidden btnRed text-white`}
          onClick={() => setOpenSidenav(dispatch, false)}>
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => {
          const isLogin = title === "login";
          if (isLogin) {
            return null;
          }
          // Filtra las páginas basadas en los permisos y exclusiones
          const filteredPages = pages
            .filter(({ name }) => {
              if (user) {
                return permisosId.some(id => {
                  let perms = permisosList.find(pl => pl.IdPermiso == id)?.NombreDelPermiso;
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
                  if (perms === "Agendamiento" && (user.IdRol == 1 || user.IdRol == 2)) {
                    otherNames = otherNames.concat("Servicios");
                  }
                  if (perms === "Gestión de gastos operativos") {
                    otherNames = otherNames.concat("Conceptos gastos");
                    otherNames = otherNames.concat("Gastos operativos");
                  }
                  return perms === name || otherNames.includes(name);
                });
              }
              return true;
            })
            .filter(({ name }) => {
              const excludedPages = ["Perfil", "Gestión ventas", "Gestión compras"];
              return !excludedPages.includes(name);
            });

          // No renderizar el título ni el ul si no hay páginas filtradas
          if (filteredPages.length === 0) {
            return null;
          }

          return (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "black"}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {filteredPages.map(({ icon, name, path }) => {
                return (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={isActive ? "white" : sidenavType === "dark" ? "white" : "gray"}
                          className={isActive ? "flex items-center gap-4 px-4 capitalize cardHeadCol" : "flex items-center gap-4 px-4 capitalize"}
                          fullWidth
                          onClick={() => setOpenSidenav(dispatch, false)}
                        >
                          {icon}
                          <Typography
                            color={isActive ? "white" : sidenavType === "dark" ? "white" : "black"}
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          );
        })}


      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandName: "The Warrior Barber Shop",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
