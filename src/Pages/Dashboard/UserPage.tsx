import React from "react";
import UserList from "../../Components/Layout/Management/User/UserList";

const UsersPage = () => {

  return (
    <div className={`flex flex-col w-full h-full `}>
      <UserList />
    </div>
  );
};

export default UsersPage;