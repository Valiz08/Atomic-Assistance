const ftp = require("basic-ftp");
const fs = require("fs");

async function subirArchivoPorFTP(buffer, carpetaUsuario, nombreArchivo) {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: 'ftp.'.process.env.SERVER_IP,
      user: process.env.SERVER_USER,
      password: process.env.SERVER_PASS,
      secure: false, //  true si FTPS
    });

    // Verificar o crear carpeta del usuario
    await client.ensureDir(`/uploads/${carpetaUsuario}`);
    await client.cd(`/uploads/${carpetaUsuario}`);

    // Guardar temporalmente ,el archivo 
    const rutaTemporal = `./temp_${nombreArchivo}`;
    fs.writeFileSync(rutaTemporal, buffer);
    await client.uploadFrom(rutaTemporal, nombreArchivo);

    // Borrar archivo temporal local
    fs.unlinkSync(rutaTemporal);

    return true;
  } catch (error) {
    console.error("Error FTP:", error);
    throw error;
  } finally {
    client.close();
  }
}

module.exports = { subirArchivoPorFTP };