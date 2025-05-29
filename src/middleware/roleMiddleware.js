function onlyCliente(req, res, next) {
    if (req.user.role !== 'cliente') {
        return res.status(403).json({ message: 'Acesso restrito a clientes.' });
    }
    next();
}

function onlyTecnico(req, res, next) {
    if (req.user.role !== 'tecnico') {
        return res.status(403).json({ message: 'Acesso restrito a técnicos.' });
    }
    next();
}

function onlyAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a administradores.' });
    }
    next();
}

function onlyGestor(req, res, next) {
    if (req.user && req.user.role === 'gestor') {
        return next();
    }
    return res.status(403).json({ message: 'Acesso restrito a gestores.' });
}

module.exports = {
    onlyCliente,
    onlyTecnico,
    onlyAdmin,
    onlyGestor
};