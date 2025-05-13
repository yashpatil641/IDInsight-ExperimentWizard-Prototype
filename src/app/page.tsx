import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg mt-10">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block mb-2 text-slate-100">AI-Powered</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Experiment Creator
            </span>
          </h1>
          
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Design sophisticated experiments with intelligent AI guidance. 
            No coding required.
          </p>
          
          <div className="mt-10">
            <Link
              href="/wizard"
              className="flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-gray-900/80 backdrop-blur-md border border-slate-700 hover:bg-gray-800 transition-colors duration-300"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <div className="p-6 bg-gray-900/60 backdrop-blur-md rounded-xl border border-slate-700">
            <h3 className="text-lg font-medium text-sky-400 mb-2">AI-Powered Guidance</h3>
            <p className="text-slate-300">
              Intelligent suggestions for sample sizes, randomization methods, and variable selection.
            </p>
          </div>
          
          <div className="p-6 bg-gray-900/60 backdrop-blur-md rounded-xl border border-slate-700">
            <h3 className="text-lg font-medium text-sky-400 mb-2">Step-by-Step Wizard</h3>
            <p className="text-slate-300">
              A guided process that breaks down complex decisions into simple steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}