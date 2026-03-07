import { useState, useMemo } from 'react';
import { ArrowLeft, ExternalLink, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOCKED_SIMULATIONS } from '@/constants';

interface InteractiveResourcesViewProps {
  onBack: () => void;
}

export function InteractiveResourcesView({ onBack }: InteractiveResourcesViewProps) {
  const [activeTab, setActiveTab] = useState('Biologia');
  const [selectedSeries, setSelectedSeries] = useState('todas');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(MOCKED_SIMULATIONS.map(sim => sim.category)));
    return cats.sort();
  }, []);

  const seriesOptions = useMemo(() => {
    const series = Array.from(new Set(MOCKED_SIMULATIONS.map(sim => sim.series)));
    return ['todas', ...series.sort()];
  }, []);

  const filteredSimulations = useMemo(() => {
    return MOCKED_SIMULATIONS.filter(sim => {
      const matchCategory = sim.category === activeTab;
      const matchSeries = selectedSeries === 'todas' || sim.series === selectedSeries;
      return matchCategory && matchSeries;
    });
  }, [activeTab, selectedSeries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" />
              Recursos Interativos
            </h2>
            <p className="text-muted-foreground">
              Explore simulações e ferramentas práticas para complementar seus estudos.
            </p>
          </div>
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedSeries} onValueChange={setSelectedSeries}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os anos</SelectItem>
              {seriesOptions.filter(s => s !== 'todas').map(series => (
                <SelectItem key={series} value={series}>
                  {series}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="flex-1 min-w-[120px]">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            {filteredSimulations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma simulação encontrada para os filtros selecionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSimulations.map((sim) => (
                  <Card key={sim.id} className="flex flex-col">
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg">{sim.title}</CardTitle>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary">{sim.category}</Badge>
                        <Badge variant="outline">{sim.series}</Badge>
                      </div>
                      <CardDescription>{sim.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {/* Espaço para futura imagem da simulação */}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" asChild>
                        <a href={sim.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                          Abrir Simulação
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          Algumas das simulações fornecidas utilizam o projeto <a href="https://phet.colorado.edu/pt_BR" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">PhET Interactive Simulations</a> da Universidade do Colorado Boulder.
        </p>
      </div>
    </div>
  );
}
