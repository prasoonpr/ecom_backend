import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { 
    return res.status(401).json({ message: 'Access token is required' });
  }
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const verifyAdminToken = (req, res, next) => {  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { 
    return res.status(401).json({ message: 'Access token is required' });
  }
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};