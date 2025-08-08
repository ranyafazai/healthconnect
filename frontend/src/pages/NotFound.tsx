import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFound() {
    const navigation = useNavigate();
  return <div className=" flex flex-col items-center justify-center h-screen text-center">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="text-lg mb-6">The page you are looking for does not exist.</p>
    <p className="text-sm text-gray-500 mb-8">You can go back to the home page or check other sections.</p>        
    <Button className="m-4" onClick={() => navigation("/")}>
        Go to Home
    </Button>
    </div>;
}

export default NotFound;
