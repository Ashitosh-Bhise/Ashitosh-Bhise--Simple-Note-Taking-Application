import jsonwebtoken from 'jsonwebtoken';
import User from 'models/User';
import dbConnect from 'utils/dbConnect';

const jwt = jsonwebtoken;

const withAuth = (handler) => {
  return async (req, res) => {
    try {
      await dbConnect();

      const token = req.headers.authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({
        _id: decoded._id,
        tokens: token,
      });

      if (!user) {
        throw new Error();
      }

      req.user = user;
      req.token = token;
      return handler(req, res);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, error: 'Please authenticate' });
    }
  };
};

export default withAuth;
