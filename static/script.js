const formulario = document.getElementById('formulario');
const usuarioInput = document.getElementById('usuario');
const campoEmail = document.getElementById('campo-email');
const passwordInput = document.getElementById('password');
const mensaje = document.getElementById('mensaje');
const boton = document.getElementById('boton');
const titulo = document.getElementById('titulo');
const subtitulo = document.getElementById('subtitulo');
const toggle = document.getElementById('toggle');
const textoCambio = document.getElementById('texto-cambio');

// Estado: 'login' o 'registro'
let modo = 'login';

// Cambiar entre modo login y registro
toggle.addEventListener('click', (e) => {
    e.preventDefault();
    modo = modo === 'login' ? 'registro' : 'login';

    if (modo === 'login') {
        titulo.textContent = 'Iniciar sesión';
        subtitulo.textContent = 'Ingresa tus credenciales';
        boton.textContent = 'Entrar';
        textoCambio.textContent = '¿No tienes cuenta?';
        toggle.textContent = 'Regístrate';
        campoEmail.style.display = 'none'; //para ocultar el campo del email
    } else {
        titulo.textContent = 'Crear cuenta';
        subtitulo.textContent = 'Regístrate para empezar';
        boton.textContent = 'Registrarme';
        textoCambio.textContent = '¿Ya tienes cuenta?';
        toggle.textContent = 'Inicia sesión';
        campoEmail.style.display = 'block'; //para mostrar el campo del email
    }

    mensaje.className = 'mensaje';
    mensaje.textContent = '';
});

// Manejar el envío del formulario
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    if (!usuario || !password) {
        mostrarMensaje('Completa todos los campos', 'error');
        return;
    }

    // Preparamos el cuerpo de la petición
    const cuerpo = { usuario, password };

    // Si es registro, agregamos y validamos el email
    if (modo === 'registro') {
        const email = document.getElementById('email').value.trim();

        if (!email) {
            mostrarMensaje('El correo es obligatorio', 'error');
            return;
        }

        cuerpo.email = email;
    }

    boton.disabled = true;
    boton.textContent = 'Cargando...';

    try {
        const endpoint = modo === 'login' ? '/login' : '/register';

        const respuesta = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            if (modo === 'registro') {
                mostrarMensaje('¡Cuenta creada! Ahora inicia sesión.', 'ok');
                setTimeout(() => toggle.click(), 1200);
            } else {
                // Guardamos la sesión en localStorage
                localStorage.setItem('usuario', usuario);
                localStorage.setItem('token', data.token);

                // Redirigimos al dashboard
                mostrarMensaje('¡Bienvenido! Redirigiendo...', 'ok');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 700);
            }
        } else {
            mostrarMensaje(data.error || 'Algo salió mal', 'error');
        }
    } catch (err) {
        mostrarMensaje('Error de conexión con el servidor', 'error');
    } finally {
        boton.disabled = false;
        boton.textContent = modo === 'login' ? 'Entrar' : 'Registrarme';
    }
});


function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}