import bg from "@/assets/Images/login-bg.webp";
import logo from "@/assets/Images/Logos/main_logo.png";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { api } from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUserRole } from "@/features/user/userSlice";
import type { UserRole } from "@/types/roleTypes";

const loginSchema = z.object({
  userRole: z.string().nonempty("User role is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
});

type FormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userRole: "",
      email: "",
      password: "",
    },
  });
  const dispatch = useDispatch();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", data);

      if (response.data.data.accessToken) {
        localStorage.setItem("authToken", response.data.data.accessToken);

        dispatch(setUserRole(data.userRole as UserRole));

        const roleRedirects: Record<string, string> = {
          "Super-Admin": "/",
          Admin: "/admin/dashboard",
          Reception: "/onboarding",
          "Beach-Restaurant-Staff": "/restaurant/home",
          "Pool-Restaurant-Staff": "/restaurant/home",
        };

        const redirectPath = roleRedirects[data.userRole] || "/";
        setTimeout(() => {
          setIsLoading(false);
          navigate(redirectPath);
          toast.success("Login Successful!");
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      setIsLoading(false);
    }
  }; 

  return (
    <div
      className="relative flex justify-center items-center w-full h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Glassy Overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-md"></div>

      {/* Login Card */}
      <div className="relative z-10 flex justify-center items-center flex-col gap-6 p-6 bg-white shadow-lg w-[500px] rounded-2xl">
        <img src={logo} alt="logo" className="w-32 h-auto" />
        <div className="font-bold text-2xl my-3">User Login</div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-[500px] text-[14px] font-medium text-gray-700 p-10"
          >
            {/* User Role */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full text-gray">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super-Admin">Super-Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Beach-Restaurant-Staff">
                          Beach Staff
                        </SelectItem>
                        <SelectItem value="Pool-Restaurant-Staff">
                          Pool Staff
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.userRole?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Login Button */}
            <Button type="submit" className="w-full mt-2 cursor-pointer">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Login"
              )}
            </Button>

            <Button variant="link" className="w-full mt-2 cursor-pointer">
              Forgot Password?
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;

// import bg from "@/assets/Images/login-bg.webp";
// import logo from "@/assets/Images/Logos/main_logo.png";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";
// import { api } from "@/api/axios";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { setUserRole } from "@/features/user/userSlice";
// import type { UserRole } from "@/types/roleTypes";

// const loginSchema = z.object({
//   userRole: z.string().nonempty("User role is required"),
//   email: z.string().email("Invalid email address"),
//   password: z.string().nonempty("Password is required"),
// });

// type FormValues = z.infer<typeof loginSchema>;

// const Login = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();
//   const form = useForm<FormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       userRole: "",
//       email: "",
//       password: "",
//     },
//   });
//   const dispatch = useDispatch();

//   const onSubmit = async (data: FormValues) => {
// // <<<<<<< raveesha/beverage-inventory
// //     setIsLoading(true);

// //     try {
// //       const response = await api.post("/auth/login", data);

// //       if (response.data.data.accessToken) {
// //         localStorage.setItem("authToken", response.data.data.accessToken);

// //         dispatch(setUserRole(data.userRole as UserRole));

// //         const roleRedirects: Record<string, string> = {
// //           "Super-Admin": "/",
// //           Admin: "/admin/dashboard",
// //           Reception: "/onboarding",
// //           "Beach-Restaurant-Staff": "/kitchen",
// //           "Pool-Restaurant-Staff": "/kitchen",
// //         };

// //         const redirectPath = roleRedirects[data.userRole] || "/";

// //         setTimeout(() => {
// //           setIsLoading(false);
// //           navigate(redirectPath);
// //           toast.success("Login Successful!");
// //         }, 2000);
// //       }
// //     } catch (error: any) {
// //       toast.error(error.response?.data?.message || "Something went wrong!");
// //       setIsLoading(false);
// //     }
// // =======
//   setIsLoading(true); // Show spinner immediately

//   try {
//     const response = await api.post("/auth/login", data);

//     if (response.data.data.accessToken) {
//   localStorage.setItem("authToken", response.data.data.accessToken);

//   dispatch(setUserRole(data.userRole as UserRole));

//   const roleRedirects: Record<string, string> = {
//     "Super-Admin": "/",
//     "Admin": "/admin/dashboard",
//     "Reception": "/onboarding",
//     "Beach-Restaurant-Staff": "/restaurant/home",
//     "Pool-Restaurant-Staff": "/restaurant/home",
//   };

//   return (
//     <div
//       className="relative flex justify-center items-center w-full h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
//       style={{ backgroundImage: `url(${bg})` }}
//     >
//       {/* Glassy Overlay */}
//       <div className="absolute inset-0 bg-white/20 backdrop-blur-md"></div>

//       {/* Login Card */}
//       <div className="relative z-10 flex justify-center items-center flex-col gap-6 p-6 bg-white shadow-lg w-[500px] rounded-2xl">
//         <img src={logo} alt="logo" className="w-32 h-auto" />
//         <div className="font-bold text-2xl my-3">User Login</div>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4 w-[500px] text-[14px] font-medium text-gray-700 p-10"
//           >
//             {/* User Role */}
//             <FormField
//               control={form.control}
//               name="userRole"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>User Role</FormLabel>
//                   <FormControl>
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger className="w-full text-gray">
//                         <SelectValue placeholder="Select role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Super-Admin">Super-Admin</SelectItem>
//                         <SelectItem value="Admin">Admin</SelectItem>
//                         <SelectItem value="Reception">Reception</SelectItem>
//                         <SelectItem value="Beach-Restaurant-Staff">
//                           Beach Staff
//                         </SelectItem>
//                         <SelectItem value="Pool-Restaurant-Staff">
//                           Pool Staff
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage>
//                     {form.formState.errors.userRole?.message}
//                   </FormMessage>
//                 </FormItem>
//               )}
//             />

//             {/* Username */}
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Username</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter username" {...field} />
//                   </FormControl>
//                   <FormMessage>
//                     {form.formState.errors.email?.message}
//                   </FormMessage>
//                 </FormItem>
//               )}
//             />

//             {/* Password */}
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Enter password"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage>
//                     {form.formState.errors.password?.message}
//                   </FormMessage>
//                 </FormItem>
//               )}
//             />

//             {/* Login Button */}
//             <Button type="submit" className="w-full mt-2 cursor-pointer">
//               {isLoading ? (
//                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
//               ) : (
//                 "Login"
//               )}
//             </Button>

//             <Button variant="link" className="w-full mt-2 cursor-pointer">
//               Forgot Password?
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default Login;
