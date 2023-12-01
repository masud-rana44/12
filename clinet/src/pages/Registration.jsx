import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import { LiaSpinnerSolid } from "react-icons/lia";

import useAuth from "../hooks/useAuth";
import { generateToken, saveUser } from "../api/apiAuth";
import { imageUpload } from "../api/utils";
import { useForm } from "react-hook-form";
import Title from "../components/Shared/Title";

const emailVerification = /\S+@\S+\.\S+/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;

const Registration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    createUser,
    updateUserProfile,
    signInWithGoogle,
    loading,
    setLoading,
  } = useAuth();
  const { register, handleSubmit } = useForm();

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data) => {
    const name = data.name;
    const email = data.email;
    const password = data.password;
    const image = data.image[0];

    if (!name || !image || !email || !password) {
      return toast.error("Missing required fields.");
    }

    if (!emailVerification.test(email)) {
      return toast.error("Please enter a valid email");
    }

    if (!passwordRegex.test(password)) {
      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters long.");
      } else if (!/[A-Z]/.test(password)) {
        return toast.error("Password must contain at least one capital letter");
      } else if (!/[\W_]/.test(password)) {
        return toast.error(
          "Password must contain at least one special character"
        );
      }
    }

    try {
      // upload image
      const imageUrl = await imageUpload(image);

      // create account
      const { user } = await createUser(email, password);

      // update profile
      await updateUserProfile(name, imageUrl);

      // create token
      await generateToken(user?.email);

      // save the users data into database
      await saveUser(user);

      toast.success("Account created successfully!");
      navigate(from);
    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // create account
      const { user } = await signInWithGoogle();

      // create token
      await generateToken(user?.email);

      // save the users data into database
      await saveUser(user);

      toast.success("Account created successfully!");
      navigate(from);
    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <Title title="Registration | Talent Hunt" />
      <div className="flex flex-col max-w-md p-6 rounded-md sm:p-10 bg-gray-100 text-gray-900">
        <div className="mb-8 text-center">
          <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
          <p className="text-sm text-gray-400">Welcome to Talent Hunt</p>
        </div>
        <form
          noValidate=""
          action=""
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 ng-untouched ng-pristine ng-valid"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                {...register("name")}
                placeholder="Enter Your Name Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-blue-500 bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
              />
            </div>
            <div>
              <label htmlFor="image" className="block mb-2 text-sm">
                Select Image:
              </label>
              <input
                required
                type="file"
                id="image"
                {...register("image")}
                name="image"
                accept="image/*"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                {...register("email")}
                required
                placeholder="Enter Your Email Here"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-blue-500 bg-gray-200 text-gray-900"
                data-temp-mail-org="0"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm mb-2">
                  Password
                </label>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                id="password"
                {...register("password")}
                required
                placeholder="*******"
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-blue-500 bg-gray-200 text-gray-900"
              />
            </div>
          </div>

          <div>
            <button
              disabled={loading}
              type="submit"
              className="bg-blue-500 w-full rounded-md py-3 text-white"
            >
              {loading ? (
                <LiaSpinnerSolid className="animate-spin mx-auto" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center pt-4 space-x-1">
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
          <p className="px-3 text-sm dark:text-gray-400">
            Signup with social accounts
          </p>
          <div className="flex-1 h-px sm:w-16 dark:bg-gray-700"></div>
        </div>
        <div
          onClick={handleGoogleSignIn}
          className="flex justify-center items-center space-x-2 border m-3 p-2 border-gray-300 border-rounded cursor-pointer"
        >
          <FcGoogle size={32} />

          <p>Continue with Google</p>
        </div>
        <p className="px-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="hover:underline hover:text-blue-500 text-gray-600"
          >
            Login
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Registration;