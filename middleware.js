export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/shorten/:path*", 
    "/dashboard/:path*", 
  ],
};
