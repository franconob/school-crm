import {
  Button,
  FormControl,
  FormLabel,
  VStack,
  FormHelperText,
  Radio,
  RadioGroup,
} from "@hope-ui/solid";
import { createSignal, For } from "solid-js";
import { invoke } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import { Grade } from "../../state";
import { useAppState } from "../../state/hooks";

export default function ImportData() {
  const [file, setFile] = createSignal<string | null>();
  const [grade, setGrade] = createSignal<Grade["id"]>();
  const [appState, { setStudents }] = useAppState();

  const handleOnFile = async () => {
    const path = await open({
      multiple: false,
    });

    setFile(Array.isArray(path) ? path[0] : path);
  };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    await invoke("import_clients", { path: file(), gradeId: grade() });
  }

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit}
      spacing="24px"
      alignItems="flex-start"
      maxW={300}
    >
      <FormControl>
        <FormLabel>Seleccione grado</FormLabel>
        <RadioGroup onChange={setGrade} required>
          <For each={appState.grades}>
            {(grade) => (
              <Radio css={{ color: grade.color }} value={grade.id}>
                {grade.name}
              </Radio>
            )}
          </For>
        </RadioGroup>
      </FormControl>
      <FormControl required>
        <Button variant="outline" onClick={handleOnFile}>
          Seleccione archivo
        </Button>
        <FormHelperText>{file()}</FormHelperText>
      </FormControl>
      <Button type="submit">Aceptar</Button>
    </VStack>
  );
}
