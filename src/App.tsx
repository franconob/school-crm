import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";

import StudentList from "./modules/student/List";
import Main from "./modules/Main";
import Edit from "./modules/student/Edit";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Main />}>
          <Route path="grade/:gradeId" element={<StudentList />} />
        </Route>
        <Route path="student/:id" element={<Edit />} />
      </>
    )
  );

  return (
    <ConfigProvider>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
