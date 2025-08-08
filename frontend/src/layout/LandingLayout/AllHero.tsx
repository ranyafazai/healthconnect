import React from "react";
import { Hero } from "../../components/LoadingPage/Hero";
import { FindYourDoctor } from "../../components/LoadingPage/FindYourDoctor";
import { WhyChooseHealthConnect } from "../../components/LoadingPage/WhyChooseHealthConnect";
import { PatientTestimonials } from "../../components/LoadingPage/PatientTestimonials";

export const AllHero = () => {
return (
    <div>
        <Hero />
        <FindYourDoctor />
        <WhyChooseHealthConnect />
        <PatientTestimonials />
    </div>
);
};