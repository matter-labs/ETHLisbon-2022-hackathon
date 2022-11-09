import React from "react";
import Home from "./ui/pages/Home/Home";
import Create from "./ui/pages/Create/Create";
import ProjectPage from "./ui/pages/ProjectPage/ProjectPage";
import Reward from "./ui/pages/Reward/Reward";

export enum RouteKey {
  Home = "/",
  Create = "/create",
  ProjectPage = "/project/:tokenAddress",
  Reward = "/project/:tokenAddress/reward",
}
// list of all the routes of the App
export const routes = [ {
  key: RouteKey.Home,
  protected: false,
  path: RouteKey.Home,
  component: <Home/>,
}, {
  key: RouteKey.Create,
  protected: false,
  path: RouteKey.Create,
  component: <Create />,
}, {
  key: RouteKey.ProjectPage,
  protected: false,
  path: RouteKey.ProjectPage,
  component: <ProjectPage />,
}, {
  key: RouteKey.Reward,
  protected: false,
  path: RouteKey.Reward,
  component: <Reward />,
}]
