# Oton Pilot Service

`oton-pilot-service` es el componente backend del ecosistema Oton Pilot. Se ejecuta en el servidor de despliegue objetivo (o localmente) y es responsable de gestionar el ciclo de vida de las aplicaciones, redirigir las peticiones a los contenedores correctos y mantener el estado de los despliegues.

Actúa efectivamente como un agente y un proxy inverso, recibiendo comandos de la CLI (vía SSH o directamente) y enrutando el tráfico público a los servicios en contenedores apropiados.

---

## 🚀 Características Principales

*   **Proxy Inverso**: Enruta automáticamente el tráfico entrante al contenedor correcto basado en nombres de host o rutas.
*   **Gestión de Despliegues**: Rastrea los despliegues activos y su estado.
*   **Actualizaciones sin Inactividad**: Soporta lógica de actualizaciones blue/green o rolling (según configuración).
*   **Integración de Base de Datos**: Utiliza SQLite para almacenar el historial de despliegues, reglas de enrutamiento y tokens de aplicación.
*   **Seguridad**: Gestiona tokens de aplicación (`AppToken`) para acceso autorizado.

---

## 🛠 Instalación y Uso

### Vía Oton Pilot CLI

Típicamente, no necesitas instalar `oton-pilot-service` manualmente. La CLI de `oton-pilot` maneja la configuración cuando se configura un host remoto o un entorno local.

### Manual / Desarrollo

1.  **Requisitos Previos**:
    *   Node.js (v18+)
    *   npm

2.  **Instalar Dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecutar en Modo Desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Construir y Ejecutar**:
    ```bash
    npm run build
    node dist/server.min.js
    ```

---

## ⚙️ Configuración

El servicio se configura principalmente a través de variables de entorno.

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `PORT` | Puerto donde escucha el servicio. | `3000` |
| `DB_PATH` | Ruta al archivo de base de datos SQLite. | `./database.db` |
| `LOG_LEVEL` | Verbosidad de los logs (debug, info, error). | `info` |

---

## 🏗 Arquitectura

El servicio consta de varios módulos clave:

*   **Módulo Proxy**: Utiliza `http-proxy-middleware` para enrutar peticiones dinámicamente.
*   **Módulo de Base de Datos**: SQLite interfazado vía driver `sqlite3`.
*   **API**: Endpoints API REST para que la CLI se comunique (ej. registrar nuevas rutas).

---

Desarrollado con ❤️ por el equipo de Oton Pilot.
