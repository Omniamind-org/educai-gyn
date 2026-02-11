import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, BookOpen, Bookmark, FileText } from "lucide-react";
import { DisciplinesTab } from "./secretary/DisciplinesTab";
import { StudentsView } from "./secretary/StudentsView";
import { TeachersView } from "./secretary/TeachersView";
import { ClassesView } from "./secretary/ClassesView";
import { BoletosView } from "./secretary/BoletosView";
import { SecretaryStatsGrid } from "./secretary/SecretaryStatsGrid";
import { CredentialsDialog } from "./secretary/CredentialsDialog";
import { useSecretaryDashboard } from "@/hooks/dashboard/useSecretaryDashboard";

export function SecretaryDashboard() {
  const {
    stats,
    showCredentials,
    setShowCredentials,
    newCredentials,
    copied,
    handleCredentialsCreated,
    copyToClipboard
  } = useSecretaryDashboard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Secretaria</h2>
        <p className="text-muted-foreground">Gerencie alunos, professores, turmas e boletos</p>
      </div>

      {/* Stats Cards */}
      <SecretaryStatsGrid stats={stats} />

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Professores
            </TabsTrigger>
            <TabsTrigger value="classes" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Turmas
            </TabsTrigger>
            <TabsTrigger value="disciplines" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Disciplinas
            </TabsTrigger>
            <TabsTrigger value="boletos" className="gap-2">
              <FileText className="h-4 w-4" />
              Boletos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="students" className="space-y-4">
          <StudentsView onCredentialsCreated={handleCredentialsCreated} />
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <TeachersView onCredentialsCreated={handleCredentialsCreated} />
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <ClassesView />
        </TabsContent>

        <TabsContent value="disciplines" className="space-y-4">
          <DisciplinesTab />
        </TabsContent>

        <TabsContent value="boletos" className="space-y-4">
          <BoletosView />
        </TabsContent>
      </Tabs>

      {/* Credentials Dialog */}
      <CredentialsDialog 
        isOpen={showCredentials}
        onOpenChange={setShowCredentials}
        credentials={newCredentials}
        onCopy={copyToClipboard}
        copiedState={copied}
      />
    </div>
  );
}
