
import { Outlet, Link, Routes, Route } from 'react-router-dom';
import Sidebarprofile from "./profileLayout/Sidebar.profile";
import BasicInfo from './profileLayout/BasicInfo';
import ContactInfo from './profileLayout/ContactInfo';
import ProfessionalDetails from './profileLayout/ProfessionalDetails';
import Availability from './profileLayout/Availability';
// import BasicInfo from './BasicInfo';
// import ContactInfo from './ContactInfo';
// import ProfessionalDetails from './ProfessionalDetails';
// import Availability from './Availability';

export default function Profile() {
 return (
    
      <div className="">
        <Sidebarprofile />
        <main className="flex-1 p-6">
           <Routes>
              <Route  path="basics" element={<BasicInfo />} />
              <Route path="contact" element={<ContactInfo />} />
              <Route path="professional" element={<ProfessionalDetails />} />
              <Route path="availability" element={<Availability />} />
              </Routes>
              <div className="mt-8 pt-4 border-t">
        <p className="text-gray-500 text-sm">Last updated: August 3, 2025</p>
      </div>
        </main> 
      </div>
  );
}