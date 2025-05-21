import {
  ScissorsIcon, UserCircleIcon, UsersIcon, Cog6ToothIcon, ShoppingCartIcon,
  CubeIcon, ShoppingBagIcon, UserGroupIcon, CalendarIcon,
  ClipboardDocumentListIcon, DocumentTextIcon, NoSymbolIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/solid";
import {
  Rols, Proveedores, Usuarios, Compras,
  Servicios, Insumos, Empleados, Agenda, Clientes,
  Ventas, Gestionventas, GestionCompras, GestionConceptoGasto, GastosOperativos, Profile
} from "@/pages/dashboard";
import { SignIn, SignUp, Recovery, NotFound } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [

  {
    title: "Configuración",
    layout: "dashboard",
    pages: [
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Roles",
        path: "/rols",
        element: <Rols />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Perfil",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Usuarios",
        path: "/usuarios",
        element: <Usuarios />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Empleados",
        path: "/empleados",
        element: <Empleados />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Clientes",
        path: "/clientes",
        element: <Clientes />,
      },
    ],
  },
  {
    title: "Compras",
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Compras",
        path: "/compras",
        element: <Compras />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Gestión compras",
        path: "/gestion_compras",
        element: <GestionCompras />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Insumos",
        path: "/insumos",
        element: <Insumos />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Proveedores",
        path: "/proveedores",
        element: <Proveedores />,
      },
    ],
  },
  {
    title: "Servicios",
    layout: "dashboard",
    pages: [
      {
        icon: <ScissorsIcon {...icon} />,
        name: "Servicios",
        path: "/servicios",
        element: <Servicios />,
      },
      {
        icon: <CalendarIcon {...icon} />,
        name: "Agendamiento",
        path: "/agenda",
        element: <Agenda />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "Conceptos gastos",
        path: "/conceptogasto",
        element: <GestionConceptoGasto />,
      },
      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "Gastos operativos",
        path: "/gastosoperativos",
        element: <GastosOperativos />,
      },
    ],
  },
  {
    title: "Ventas",
    layout: "dashboard",
    pages: [
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Ventas",
        path: "/ventas",
        element: <Ventas />,
      },
      {
        icon: <ShoppingBagIcon  {...icon} />,
        name: "Gestión ventas",
        path: "/gestion_ventas",
        element: <Gestionventas />,
      },
    ],
  },
  {
    title: "login",
    layout: "auth",
    pages: [
      {
        icon: <ArrowDownTrayIcon {...icon} style={{ transform: "rotate(90deg)" }} />,
        name: "404",
        path: "/notfound",
        element: <NotFound />,
      },
      {
        icon: <ArrowDownTrayIcon {...icon} style={{ transform: "rotate(90deg)" }} />,
        name: "Recuperar",
        path: "/recovery",
        element: <Recovery />,
      },
      {
        icon: <ArrowDownTrayIcon {...icon} style={{ transform: "rotate(90deg)" }} />,
        name: "Salir",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <ArrowDownTrayIcon {...icon} style={{ transform: "rotate(90deg)" }} />,
        name: "Registro",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

// export const filteredRoutes = routes.filter(route => route.title !== "Ventas" && route.pages.every(page => page.name !== "Gestion_ventas"));

export default routes;
