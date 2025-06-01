# Bot para Enviar Mensajes a WhatsApp desde Cualquier Lugar

Este proyecto implementa un bot de WhatsApp usando Node.js y la librería `whatsapp-web.js`, permitiéndote enviar y recibir mensajes, así como integrarlo con tu propia API para automatizar tareas.

## Tecnologías Utilizadas

* **`dotenv`**: `^16.5.0`
    * Gestiona variables de entorno, permitiéndote configurar tu aplicación sin codificar información sensible directamente en el código fuente.

* **`express`**: `^5.1.0`
    * Un _framework_ web rápido y minimalista para Node.js, utilizado para construir la API REST que interactúa con tu bot de WhatsApp.

* **`qrcode-terminal`**: `^0.12.0`
    * Genera códigos QR directamente en la terminal, lo que facilita el escaneo para autenticar tu cuenta de WhatsApp.

* **`whatsapp-web.js`**: `^1.28.0`
    * La librería principal que te permite controlar una instancia de WhatsApp Web, enviando y recibiendo mensajes, gestionando chats y más.

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```bash
├── controllers/
│   ├── iniciar-wsp.js
│   ├── messages-wsp.js
│   └── whatsappUtils.js  (Opcional, para utilidades de WhatsApp a futuro)
├── routes/
│   └── whatsappRoutes.js (rutas post mandar mensajes individual y a grupos)
├── .env                  (Archivo de configuración de entorno)
├── index.js              (Punto de entrada de la aplicación)
├── package.json
└── package-lock.json
```

## Arquitectura usada

* Usamos la arquitectura MVC modificada
  
## Trayecto de los datos

* index.js -> levanta express, llama a inicializar el bot en /controllers/iniciar-wsp.js -> exporta el cliente para poder usarlo en otrs archivos
* queda esperando al llamado de las rutas
* ingresan rutas post y llaman a /controllers para enviar los mensajes


## Como usar

1. **Clonar el repositorio**

```bash
git@github.com:Cormaxs/bot-wsp.git
```

2. **Instalar dependencias**


```bash
    npm install
 ```

3.  **Crear el archivo `.env`** en la raíz del proyecto y configurarlo:

    ```env
    PORT=3000
    ```

4.  **Iniciar el bot**:


```bash
    node index.js
```

5.  **Escanear el QR**: Si es la primera vez, se mostrará un código QR en tu terminal. Escanéalo con tu teléfono desde WhatsApp > Dispositivos vinculados.


6.  **Pruebas**:
    * Envía un mensaje a tu número de WhatsApp para ver la respuesta del bot y la notificación en tu consola.
    * Usa una herramienta como Postman o Insomnia para enviar una petición `POST` a `http://localhost:3000/api/whatsapp/send-message` con un cuerpo JSON como:
  
```json
        {
          "chatId": "5491112345678@c.us", 
          "message": "Hola desde la API!"
        }
 ```
        (Reemplaza el `chatId` con el tuyo o el de un grupo).

---

## CONSIDERACIONES AL USAR

**el numero de celular destino debe estar bien formateado**:
el formateo debe ser 
pais -> 54
agregado de whatsapp -> 9
provincia -> 3834
numero -> 001122

```json
"number": "5493834001122", 
"message": "el mensaje que quieran"
```

**Todo debe ser string, no importa si es numero o no, debe estar formateado a string**:

**Al enviar a grupos**: groupName debe tener el nombre exacto del grupo, respetando mayusculas, espacios

```json
  "groupName": "Grupo-bot-wsp-demo",
"message": "el mensaje que quieran"
```


## rutas 

* post /api/whatsapp/send-message 
* post /api/whatsapp/send-message-group