const Client = require('ssh2-sftp-client')

async function subirArchivoSFTP(buffer, carpetaUsuario) {
    const sftp = new Client();
    try {
        await sftp.connect({
            host: process.env.SERVER_HOST.trim(),
            port: 22,
            username: process.env.SERVER_USER.trim(),
            password: process.env.SERVER_PASS.trim()
        });

        // Crear carpeta si no existe
        const remoteDir = `/var/www/vhosts/atomic-assistance.es/uploads/${carpetaUsuario}`;
        try { await sftp.mkdir(remoteDir, true); } catch {}

        // Subir archivo directamente desde buffer
        const remotePath = `${remoteDir}/${carpetaUsuario}.pdf`;
        try{
            await sftp.put(buffer, remotePath);
        } catch(err){
            console.log(err)
        }

        console.log("Archivo subido correctamente via SFTP");
        return true;
    } catch (err) {
        console.error("Error SFTP:", err);
        throw err;
    } finally {
        sftp.end();
    }
}


module.exports = { subirArchivoSFTP };