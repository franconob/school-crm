import { Button, FormControl, FormLabel, Input, VStack } from "@hope-ui/solid";
import { invoke } from "@tauri-apps/api";
import { createSignal } from "solid-js";
import { Grade } from "../../state";
import { useAppState } from "../../state/hooks";

export default function AddGrade() {
  const [name, setName] = createSignal<string | null>(null);
  const [color, setColor] = createSignal<string | null>(null);
  const [, { addGrade }] = useAppState();

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!(name() && color())) return;

    try {
      const gradeId: number = await invoke("add_grade", {
        grade: { name: name(), color: color() },
      });
      addGrade({
        id: gradeId,
        name: name() as string,
        color: color() as string,
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <VStack spacing="$4" as="form" alignItems="flex-start" maxW={300}>
      <FormControl>
        <FormLabel for="name">Nombre</FormLabel>
        <Input id="name" onInput={(e) => setName(e.currentTarget.value)} />
        <FormLabel for="color">Color</FormLabel>
        <Input id="color" onInput={(e) => setColor(e.currentTarget.value)} />
      </FormControl>
      <Button type="submit" onClick={handleSubmit}>
        Aceptar
      </Button>
    </VStack>
  );
}
