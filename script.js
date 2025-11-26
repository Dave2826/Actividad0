// ===================== ELEMENTOS =====================
const mensaje = document.getElementById('mensaje');
const charCount = document.querySelector('.char-count');
const matrizMensaje = document.getElementById('matrizMensaje');

const resultadoEncriptado = document.getElementById('resultadoEncriptado');
const resultadoDesencriptado = document.getElementById('resultadoDesencriptado');

const k11 = document.getElementById('k11');
const k12 = document.getElementById('k12');
const k21 = document.getElementById('k21');
const k22 = document.getElementById('k22');

const btnEncriptar = document.getElementById('encriptar');
const btnDesencriptar = document.getElementById('desencriptar');

// ===================== CONTADOR =====================
mensaje.addEventListener('input', () => {
    const len = mensaje.value.length;
    charCount.textContent = `${len}/30`;
    mostrarMatrizMensaje();
});

// ===================== MATRIZ MENSAJE =====================
function mostrarMatrizMensaje() {
    let texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (texto.length === 0) {
        matrizMensaje.textContent = 'Escribe un mensaje primero...';
        return;
    }

    const valores = texto.split('').map(c => c.charCodeAt(0) - 65);

    let matriz = '[';
    for (let i = 0; i < valores.length; i += 2) {
        if (i > 0) matriz += ' ';
        matriz += `[${valores[i]}, ${valores[i + 1] ?? 23}]`;
    }
    matriz += ']';

    matrizMensaje.textContent = matriz;
}

// ===================== ENCRIPTAR =====================
btnEncriptar.addEventListener('click', () => {

    // Guardamos la posición real de los espacios del usuario
    const espacios = [];
    [...mensaje.value].forEach((c,i) => {
        if (c === ' ') espacios.push(i);
    });
    localStorage.setItem("espaciosOriginales", JSON.stringify(espacios));

    // Texto limpio
    let texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');

    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];

    let numeros = texto.split('').map(c => c.charCodeAt(0) - 65);

    let seAgregoPadding = false;

    if (numeros.length % 2 !== 0) {
        numeros.push(23);    // agregar X
        seAgregoPadding = true;
    }

    // Guardamos si se agregó padding
    localStorage.setItem("padding", seAgregoPadding ? "1" : "0");

    let encriptado = '';

    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i], v2 = numeros[i + 1];

        const c1 = (key[0][0] * v1 + key[0][1] * v2) % 26;
        const c2 = (key[1][0] * v1 + key[1][1] * v2) % 26;

        encriptado += String.fromCharCode(65 + c1);
        encriptado += String.fromCharCode(65 + c2);
    }

    resultadoEncriptado.textContent = encriptado;
});

// ===================== DESENCRIPTAR =====================
btnDesencriptar.addEventListener('click', () => {

    let texto = resultadoEncriptado.textContent.trim().replace(/[^A-Z]/g, '');
    if (texto.length === 0) {
        resultadoDesencriptado.textContent = "Error: primero encripta un mensaje";
        return;
    }

    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];

    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    if (det === 0) {
        resultadoDesencriptado.textContent = "Error: matriz clave no invertible";
        return;
    }

    // Inverso modular
    let invDet = 0;
    for (let i = 0; i < 26; i++) {
        if ((det * i) % 26 === 1) {
            invDet = i;
            break;
        }
    }

    const invKey = [
        [( key[1][1] * invDet) % 26, (-key[0][1] * invDet + 26) % 26],
        [(-key[1][0] * invDet + 26) % 26, ( key[0][0] * invDet) % 26]
    ];

    let numeros = texto.split('').map(c => c.charCodeAt(0) - 65);
    let original = '';

    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i], v2 = numeros[i + 1];

        const c1 = (invKey[0][0] * v1 + invKey[0][1] * v2) % 26;
        const c2 = (invKey[1][0] * v1 + invKey[1][1] * v2) % 26;

        original += String.fromCharCode(65 + c1);
        original += String.fromCharCode(65 + c2);
    }

    // ===================== QUITAR LA X FINAL =====================
    const padding = localStorage.getItem("padding");

    if (padding === "1" && original.endsWith("X")) {
        original = original.slice(0, -1); // quitar última letra
    }

    // ===================== RESTAURAR ESPACIOS =====================
    const espacios = JSON.parse(localStorage.getItem("espaciosOriginales") || "[]");

    let chars = original.split('');
    espacios.forEach(pos => {
        if (pos <= chars.length) chars.splice(pos, 0, ' ');
    });

    resultadoDesencriptado.textContent = chars.join('');
});
