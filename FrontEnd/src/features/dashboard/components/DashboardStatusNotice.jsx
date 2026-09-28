import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';

export function DashboardStatusNotice() {
  return (
    <div className="mb-5">
      <IntegrationNotice>
        A lista da API é global e ainda não representa uma equipe vinculada ao gestor. Os estados de
        atividade são aproximados pela última leitura; o backend ainda não informa a conexão do
        Agente.
      </IntegrationNotice>
    </div>
  );
}
