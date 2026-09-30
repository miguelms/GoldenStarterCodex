# Contrato común de resultados v1

Cada agente conserva entregables propios, pero reporta un envelope común. El integrador persiste `artifacts/results/<task>/<run>/<agent>.json`. No escribir todos a un log mutable. El esquema está en [agent-result.schema.json](agent-result.schema.json); ejemplo válido de bloqueo en [agent-result.example.json](agent-result.example.json).

Campos: schema_version, task_id, run_id, agent_id, evaluated_ref (commit o digest de snapshot), status, verdict, summary, files_changed, deliverables, checks, blockers y next_action. Si el cambio está sin commit, capturar snapshot/digest; no inventar SHA. PASS enlaza un artifact verificable que corresponde a esa referencia.

`status`: COMPLETED, FAILED o BLOCKED describe ejecución del encargo. `verdict`: APPROVED, REJECTED, BLOCKED o NOT_APPLICABLE describe revisión. Los implementadores suelen usar NOT_APPLICABLE; QA usa los otros estados.

`checks[].status`: PASS, FAIL, NOT_RUN, NOT_APPLICABLE. Check requerido tiene PASS antes de APPROVED. Si falta runner/cuenta/entorno es NOT_RUN/BLOCKED; no cero fallos. Check no aplicable lleva razón y required=false. Un reporte de documento puede aprobar mediante método de revisión y exit_code=null, siempre con artifact; no inventar ejecución de shell.

La validación JSON Schema comprueba estructura y algunas condiciones de aprobación. **No prueba que la evidencia sea verdadera**: un validador del proyecto debe comprobar identidad de SHA/artefacto, existencia y contenido de archivos, checks requeridos del plan QUALITY y procedencia del runner. El agente no puede decidir por sí solo qué gates omitir.

Los campos de dominio (costo, latencia, pruebas nativas) viven en entregables enlazados, con método y fuente. No llenar booleanos `latency_budget_met: true` por plantilla. Devolver también una explicación humana breve; evitar que el último mensaje al usuario sea solo JSON.
