import type { MenuProps } from "antd";
import { Menu, Layout } from "antd";

import AddGrade from "./grade/AddGrade";
import ImportData from "./import/ImportData";
import StudentList from "./student/List";

import { useAppState } from "../state/hooks";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function Main() {
  const [state] = useAppState();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("");

  const items: MenuProps["items"] = [
    ...state.grades.map((grade) => ({
      label: grade.name,
      key: grade.id.toString(),
    })),
  ];

  const { Header, Content } = Layout;

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setCurrentTab(e.key);
    navigate(`/grade/${e.key}`);
  };

  return (
    <Layout>
      <Menu
        onClick={handleMenuClick}
        selectedKeys={[currentTab]}
        items={items}
        mode="horizontal"
      />
      <Content>{currentTab && <Outlet />}</Content>
    </Layout>
  );
}
