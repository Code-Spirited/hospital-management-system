import { Button, Input, Select, Card, Loader } from "./components/common";

function App() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col gap-6">
      <Card title="Button Component Test">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
          <Button variant="outlined">Outlined</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Input Component Test">
        <div className="flex flex-col gap-4 max-w-sm">
          <Input label="Patient Name" placeholder="Enter name" required />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            error="Invalid email"
          />
          <Input label="Disabled Field" disabled value="Cannot edit" />
        </div>
      </Card>

      <Card title="Select Component Test">
        <div className="max-w-sm">
          <Select
            label="Department"
            options={[
              { value: "opd", label: "OPD" },
              { value: "ipd", label: "IPD" },
              { value: "pharmacy", label: "Pharmacy" },
            ]}
          />
        </div>
      </Card>

      <Card title="Loader Component Test">
        <div className="flex gap-8 items-center">
          <Loader size="sm" text="" />
          <Loader size="md" text="Loading..." />
          <Loader size="lg" text="Please wait..." />
        </div>
      </Card>
    </div>
  );
}

export default App;
