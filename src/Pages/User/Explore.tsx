import React from 'react';
import Search from '../../Components/Layout/Search/Search';

const Explore: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full ">
      <div className="mt-20 md:mt-0">
        <Search />
      </div>
    </div>
  );
};

export default Explore;
