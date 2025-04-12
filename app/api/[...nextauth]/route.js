import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import { connect } from "@/utils/connect";
import bcrypt from 'bcryptjs';

async function login(credentials) {
  try {
    await connect();
    const user = await User.findOne({ email: credentials.email });
    if (!user) throw new Error("Wrong Credentials.");
    
    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) throw new Error("Wrong Credentials.");
    
    return user;
  } catch (error) {
    console.log("Error logging in:", error);
    throw new Error("Something went wrong");
  }
}

export const authOptions = {
  pages: {
    signIn: "/auth/signIn",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          if (user) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              phone: user.phone,
              role: user.role,
              verified: user.verified
            };
          }
        } catch (error) {
          console.log("Authorization error:", error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = user.phone;
        token.role = user.role;
        token.verified = user.verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.phone = token.phone;
        session.user.role = token.role;
        session.user.verified = token.verified;
      }
      return session;
    }
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
