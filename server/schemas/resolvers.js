// import user model
const { User } = require("../models");
// import sign token function from auth
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  // get a single user by either their id or their username
  Query: {
    async me(parent, args, { user }) {
      const foundUser = await User.findOne({
        _id: user._id,
      });

      if (!foundUser) {
        throw new AuthenticationError("No user with that ID!");
      }

      return foundUser;
    },
  },
  // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
  Mutation: {
    async addUser(parent, args, { user }) {
      const user = await User.create(args);

      if (!user) {
        throw new AuthenticationError("Something is wrong!");
      }
      const token = signToken(user);
      return { token, user };
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    // {args} is destructured req.args
    async login(parent, args, { user }) {
      const user = await User.findOne({
        $or: [{ username: args.username }, { email: args.email }],
      });
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }
      const token = signToken(user);
      return { token, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function

    async saveBook(parent, args, { user }) {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new AuthenticationError("Something went wrong!");
      }
    },
    // remove a book from `savedBooks`
    async removeBook(parent, args, { user }) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find user with this id!");
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;
