const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from cookies
 * Extracts and validates the token from cookies
 */
const verifyCookie = (req, res, next) => {
    try {
        // Try cookie first, then Authorization header (Bearer)
        const cookieToken = req.cookies && req.cookies.token;
        const header = req.headers && (req.headers.authorization || req.headers.Authorization);
        const bearerToken = header && header.split && header.split(' ')[1];

        const token = cookieToken || bearerToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
        }

        // Verify the JWT token
        jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret', (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token. Please login again.',
                    error: err.message
                });
            }

            // Attach the decoded user data to the request object
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error verifying cookie',
            error: error.message
        });
    }
};

/**
 * Middleware to restrict routes to authenticated users only
 * Use this for protected routes that require authentication
 */
const requireAuth = (req, res, next) => {
    try {
        // Allow header or cookie token for authenticated-required routes
        const cookieToken = req.cookies && req.cookies.token;
        const header = req.headers && (req.headers.authorization || req.headers.Authorization);
        const bearerToken = header && header.split && header.split(' ')[1];

        const token = cookieToken || bearerToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login to access this resource.'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret', (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Token is invalid or expired.'
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

const getuser = async (req, res, next) => {
    try {
        // Allow header or cookie token for authenticated-required routes
        const cookieToken = req.cookies && req.cookies.token;
        const header = req.headers && (req.headers.authorization || req.headers.Authorization);
        const bearerToken = header && header.split && header.split(' ')[1];

        const token = cookieToken || bearerToken;

        if (!token) {
            req.user = null;
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret', (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Token is invalid or expired.'
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
}


/**
 * Middleware to check if user is admin
 * Shorthand for restrictRole(['admin'])
 */
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User information not found. Please login again.'
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required. You do not have permission to access this resource.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Admin verification error',
            error: error.message
        });
    }
};

module.exports = {
    verifyCookie,
    requireAuth,
    isAdmin,
    getuser
};
