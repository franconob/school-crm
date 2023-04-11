import { useParams } from "react-router-dom";
import { useAppState } from "../../state/hooks";
import { Button, Checkbox, Col, Form, Input, Row, Select } from "antd";
import Title from "antd/es/typography/Title";
import { Student } from "../../state";

const Edit: React.FC = () => {
  const { id } = useParams();
  const [{ grades }, { findStudentById, DB }] = useAppState();
  const [form] = Form.useForm();
  let student = null;

  if (id) {
    student = findStudentById(parseInt(id, 10));

    if (!student) throw new Error("Student not found");
  }

  const handleSubmit = async (values: Student) => {
    try {
      DB.saveStudent(values);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Title>Aregar alumno</Title>
      <Form
        form={form}
        initialValues={student || {}}
        onFinish={handleSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        size="large"
      >
        <Form.Item name="grade_id" label="Grado" rules={[{ required: true }]}>
          <Select
            options={grades.map((grade) => ({
              value: grade.id,
              label: grade.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Ingrese el nombre" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="last_name"
          label="Apellido"
          rules={[{ required: true, message: "Ingrese el apellido" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="Dirección"
          rules={[{ required: true, message: "Ingrese la dirección" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="coming_from"
          label="Procedencia"
          rules={[{ required: true, message: "Ingrese la procedencia" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="date_of_birth"
          label="Fecha de nac."
          rules={[
            { required: true, message: "Ingrese la fecha de nacimiento" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="dni"
          label="Documento"
          rules={[{ required: true, message: "Ingrese el documento" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="filed"
          label="Legajo"
          wrapperCol={{ span: 16 }}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          name="phones"
          label="Teléfonos"
          rules={[{ required: true, message: "Ingrese el/los teléfonos" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="place_of_birth"
          label="Lugar de nac."
          rules={[
            { required: true, message: "Ingrese el lugar de nacimiento" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="repetitive"
          label="Repite?"
          valuePropName="checked"
          wrapperCol={{ span: 16 }}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Edit;
