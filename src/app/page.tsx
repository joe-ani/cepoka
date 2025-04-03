import Hero from "./Components/Hero";
import Offer from "./Components/Offer";
import LatestProduct from "./Components/LatestProduct";
import OpeningHours from "./Components/OpeningHours";
import Categories from "./Components/Categories";
import Review from "./Components/Review";
import AboutFugo from "./Components/AboutFugo";
import ContactForm from "./Components/ContactForm";
import Footer from "./Components/Footer";
import WhatsAppButton from "./Components/WhatsAppButton";
import BestSellers from "./Components/BestSellers";
// Removed Nav import since it's not being used

const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <div className="space-y-16 md:space-y-16"> {/* Changed to maintain spacing on both mobile and desktop */}
        {/* section 1 */}
        <div id="section1" className="flex flex-col px-0 md:px-40 pt-16 md:pt-28 pb-0 md:pb-4 text-[#333333]">
          <h2 className="text-xs md:text-sm font-[500] px-5 md:px-0">HERE&apos;s</h2>
          <h1 className="text-2xl md:text-4xl font-[600] py-2 px-5 md:px-0">What we offer.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20">
            <Offer />
          </div>
        </div>
        {/* section 2 */}
        <div className="flex flex-col font-[600] px-0 md:px-0 py-0 md:py-2 text-[#333333]">
          <h2 className="text-xs md:text-sm font-medium px-5 md:px-40">check out</h2>
          <h1 className="text-2xl md:text-4xl py-2 px-5 md:px-40">Our Best Seller.</h1>
          {/* card component*/}
          <div className=" py-8 md:py-20 flex justify-center">
            <BestSellers />
          </div>
        </div>
        {/* section 2 */}
        <div id="section3" className="flex flex-col font-[600] px-0 md:px-40 py-0 md:py-20 text-[#333333]">
          <h2 className="text-xs md:text-sm font-medium px-5 md:px-0">Opening hours</h2>
          <h1 className="text-2xl md:text-4xl py-2 px-5 md:px-0">Our Opening Hours.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20 flex justify-center">
            <OpeningHours />
          </div>
        </div>
        {/* section 3 */}
        <div className="flex flex-col px-0 md:px-40 py-0 md:py-2 text-[#333333]">
          <h2 className="text-xs md:text-sm font-medium px-5 md:px-0">CHECK OUT</h2>
          <h1 className="text-2xl md:text-4xl font-[600] py-2 px-5 md:px-0">Our Latest Product.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20">
            <LatestProduct />
          </div>
        </div>
        {/* section 4 */}
        <div className="flex flex-col font-[600] px-0 md:px-40 py-0 md:py-2 text-[#333333]">
          <h2 className="text-xs md:text-sm font-medium px-5 md:px-0">Shop</h2>
          <h1 className="text-2xl md:text-4xl py-2 px-5 md:px-0">By Categories.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20 flex justify-center">
            <Categories />
          </div>
        </div>
        {/* section 5 */}
        <div className="flex flex-col font-[600] px-0 md:px-40 py-0 md:py-2 text-[#333333]">
          <h2 className="text-xs md:text-sm font-medium px-5 md:px-0">What they say</h2>
          <h1 className="text-2xl md:text-4xl py-2 px-5 md:px-0">Customer Review.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20 flex justify-center">
            <Review />
          </div>
        </div>
        {/* section 6 */}
        <div id="section6" className="flex flex-col font-[600] px-0 md:px-40 py-0 md:py-2 text-[#333333]">
          <h2 className="text-xs md:text-sm px-5 md:px-0">About d&apos;fugo hair</h2>
          <h1 className="text-2xl md:text-4xl py-2 px-5 md:px-0">Founder and CEO.</h1>
          {/* card component*/}
          <div className="py-8 md:py-20 flex justify-center">
            <AboutFugo />
          </div>
        </div>
        {/* section 7 */}
        <div id="section7" className="flex flex-col py-8 md:py-10 text-[#333333]">
          <ContactForm />
        </div>
      </div>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

export default HomePage;

