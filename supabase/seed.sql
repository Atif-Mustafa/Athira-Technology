-- Idempotent CMS seed for the existing Athira Technology public content.
-- Run only after 20260819090000_cms.sql and after at least one active admin
-- exists. Re-running this file never overwrites CMS edits because conflicts are
-- left untouched.

do $$
declare
  seed_actor uuid;
begin
  select user_role.user_id
  into seed_actor
  from public.user_roles as user_role
  join public.profiles as profile on profile.id = user_role.user_id
  where user_role.role = 'admin'::public.app_role
    and profile.status = 'active'
  order by profile.created_at
  limit 1;

  if seed_actor is null then
    raise exception 'CMS seed requires at least one active administrator.';
  end if;

  insert into public.posts (
    slug, title, excerpt, body, status, author_name, author_id, category,
    reading_time, seo_title, seo_description, created_by, updated_by,
    published_by, published_at, created_at, updated_at
  ) values
  (
    'multi-agent-systems-for-the-sdlc',
    'How multi-agent systems can support the software lifecycle',
    'A practical model for dividing AI-assisted work by lifecycle responsibility without losing shared context or human ownership.',
    E'## Why specialization matters\n\nSoftware delivery is not one task. It is a chain of decisions, artifacts, reviews, and operational responsibilities. A single undifferentiated assistant can generate useful text or code, but it may blur who owns each decision and what evidence should move forward.\n\nA multi-agent model assigns a bounded role to each lifecycle stage. The value is less about giving agents personalities and more about defining inputs, permitted actions, outputs, and review criteria for each responsibility.\n\n## Shared context needs boundaries\n\nCoordination does not mean every agent needs every document or repository secret. A work item can carry the approved requirement, relevant constraints, artifact links, and review status while each specialist receives only the context needed for its task.\n\n- Planning should expose assumptions and unresolved ambiguity.\n- Design should record options and why one was approved.\n- Implementation should remain scoped to agreed interfaces and repository areas.\n- Testing should trace checks back to risks and acceptance criteria.\n\n## Treat artifacts as contracts\n\nThe handoff between stages becomes more reliable when each output has a known shape: acceptance criteria, an architecture decision, a change proposal, a verification report, or a release checklist. These artifacts give people something concrete to review and give the next stage explicit constraints.\n\nThis also makes partial adoption possible. A team can improve one handoff, measure whether the artifact is useful, and stop without committing to autonomous end-to-end delivery.\n\n## Keep accountability human\n\nSpecialization does not remove the need for engineering judgment. Product owners approve intent, architects approve consequential designs, developers accept code, quality owners assess evidence, and authorized operators control releases. Agent output should help those decisions, not conceal them.',
    'published', 'Athira Technology editorial team', seed_actor,
    'Product architecture', '7 min read',
    'How multi-agent systems can support the software lifecycle',
    'Explore how specialist agents can support planning, design, development, testing, deployment, monitoring, and documentation as one governed workflow.',
    seed_actor, seed_actor, seed_actor,
    '2026-07-10T00:00:00Z', '2026-07-10T00:00:00Z', '2026-07-10T00:00:00Z'
  ),
  (
    'human-approval-in-ai-assisted-development',
    'Where human approval belongs in AI-assisted development',
    'Approval gates are most useful where intent, architecture, accepted code, quality evidence, and operational risk change hands.',
    E'## Approval is a design decision\n\nAdding a person after every generated sentence creates delay without necessarily reducing risk. Removing people from consequential decisions creates the opposite problem. Good workflow design places review where authority, cost, or exposure changes.\n\nThe right gate depends on the system and organization, but five decision boundaries are broadly useful: intent, architecture, accepted implementation, quality evidence, and release authorization.\n\n## Review the intent before the artifact\n\nA polished technical plan can still solve the wrong problem. Before design begins, a responsible product or domain owner should confirm scope, constraints, acceptance criteria, and known exclusions. Ambiguity should be visible rather than silently resolved by a model.\n\n## Make technical review proportionate\n\nArchitecture and code review should focus attention according to consequence. A documentation correction and a change to authorization logic should not travel through identical gates. Repository policy, affected data, deployment reach, and reversibility can help determine the required reviewers.\n\n- Show the source context used to prepare a proposal.\n- Highlight assumptions, changed interfaces, and unresolved risks.\n- Preserve reviewer comments and resulting revisions.\n- Require explicit authorization for release or destructive actions.\n\n## Approval needs evidence\n\nA button labelled approve is not meaningful if the reviewer cannot see what was checked. Link the decision to the requirement, proposed change, test result, exception, rollback plan, and named owner. The goal is an understandable decision record, not a larger activity log.',
    'published', 'Athira Technology editorial team', seed_actor,
    'Governance', '6 min read',
    'Where human approval belongs in AI-assisted development',
    'Learn how to place proportionate human review points throughout an AI-assisted software-delivery workflow.',
    seed_actor, seed_actor, seed_actor,
    '2026-07-17T00:00:00Z', '2026-07-17T00:00:00Z', '2026-07-17T00:00:00Z'
  ),
  (
    'traceable-ai-engineering-workflows',
    'Designing traceable AI software-engineering workflows',
    'Traceability connects source intent, generated artifacts, human decisions, and delivered changes without pretending every event is equally important.',
    E'## Start with the questions you need to answer\n\nTraceability is useful when it helps a team understand why a change exists, which inputs shaped it, who accepted it, and how it was verified. Capturing every intermediate token or tool event can create volume without clarity.\n\nBegin with operational and review questions, then preserve the smallest set of records that can answer them reliably.\n\n## Use stable identifiers across artifacts\n\nA requirement, design decision, implementation change, test case, and release record should be linkable even when they live in different systems. Stable work-item and decision identifiers help maintain that thread without forcing all content into one platform.\n\n- Reference the approved source requirement and version.\n- Identify generated artifacts and the context boundary used.\n- Record review disposition and consequential revisions.\n- Link verification and release evidence to the accepted change.\n\n## Separate facts, proposals, and decisions\n\nGenerated content should not look like an approved decision. Label observations, recommendations, unresolved questions, and accepted outcomes differently. This makes the interface easier to evaluate and reduces the risk that a draft is treated as policy.\n\n## Plan for exceptions and retention\n\nReal workflows branch, fail, and require overrides. Trace design should explain who can override a gate and why. It should also define how long source context and generated records are kept, where they reside, and who can inspect them. Those choices are customer-specific governance decisions, not assumptions a product page can settle.',
    'published', 'Athira Technology editorial team', seed_actor,
    'Engineering operations', '8 min read',
    'Designing traceable AI software-engineering workflows',
    'A practical guide to designing useful trace links and decision records for AI-assisted engineering workflows.',
    seed_actor, seed_actor, seed_actor,
    '2026-07-24T00:00:00Z', '2026-07-24T00:00:00Z', '2026-07-24T00:00:00Z'
  )
  on conflict (slug) do nothing;

  insert into public.services (
    slug, title, summary, description, business_problem, scope, deliverables,
    engagement_model, icon, sort_order, active, seo_title, seo_description,
    created_by, updated_by
  ) values
  ('ai-product-strategy', 'AI product strategy', 'Turn a broad AI ambition into a governed, testable product roadmap.', '', 'Teams often have promising use cases but no shared definition of value, risk, ownership, or implementation sequence.', 'Opportunity mapping, workflow analysis, feasibility framing, governance needs, and pilot selection.', array['Use-case portfolio', 'Prioritized pilot brief', 'Risk and dependency map', 'Delivery roadmap'], 'Focused discovery workshop or short advisory engagement.', 'strategy', 10, true, null, null, seed_actor, seed_actor),
  ('custom-ai-agent-development', 'Custom AI-agent development', 'Design focused assistants around a defined business or engineering workflow.', '', 'Generic tools rarely reflect an organization’s context, approval model, or systems of record.', 'Agent boundaries, context design, tool permissions, evaluation criteria, review flows, and implementation planning.', array['Solution design', 'Prototype workflow', 'Evaluation plan', 'Operational handoff'], 'Phased prototype with explicit review gates and production-readiness assessment.', 'agents', 20, true, null, null, seed_actor, seed_actor),
  ('software-delivery-automation', 'Software-delivery automation', 'Reduce repeated coordination work while preserving engineering controls.', '', 'Manual handoffs between planning, development, testing, and release slow feedback and fragment evidence.', 'Workflow mapping, artifact automation, approval gates, CI/CD touchpoints, and traceability design.', array['Current-state map', 'Automation backlog', 'Reference workflow', 'Control checklist'], 'Workflow assessment followed by incremental automation sprints.', 'automation', 30, true, null, null, seed_actor, seed_actor),
  ('enterprise-integration', 'Enterprise integration', 'Plan reliable connections between AI workflows and existing systems.', '', 'Useful automation depends on trustworthy context and carefully bounded actions across fragmented tools.', 'API and event contracts, identity boundaries, data flows, failure handling, and integration sequencing.', array['Integration architecture', 'Interface contracts', 'Data-flow review', 'Implementation backlog'], 'Architecture engagement or implementation workstream within a broader programme.', 'integration', 40, true, null, null, seed_actor, seed_actor),
  ('platform-modernization', 'Platform modernization', 'Create a practical path from legacy constraints to maintainable delivery foundations.', '', 'Aging systems and undocumented dependencies make change risky and block responsible automation.', 'Architecture assessment, dependency discovery, modernization options, migration increments, and decision records.', array['Technical assessment', 'Target-state options', 'Migration sequence', 'Architecture decisions'], 'Assessment and roadmap, with optional delivery support for selected increments.', 'modernization', 50, true, null, null, seed_actor, seed_actor),
  ('cloud-deployment-enablement', 'Cloud and deployment enablement', 'Strengthen delivery paths, environment consistency, and release readiness.', '', 'Inconsistent environments and loosely defined release checks increase operational uncertainty.', 'Cloud architecture, container workflows, CI/CD design, configuration boundaries, and rollback preparation.', array['Deployment blueprint', 'Pipeline recommendations', 'Environment model', 'Release runbook'], 'Architecture sprint or delivery-enablement workstream.', 'cloud', 60, true, null, null, seed_actor, seed_actor),
  ('quality-engineering', 'Quality engineering', 'Connect risk, requirements, and layered verification earlier in delivery.', '', 'Late or brittle testing leaves teams without clear evidence that a change satisfies its intent.', 'Test strategy, automation architecture, coverage priorities, quality gates, and traceability.', array['Quality strategy', 'Test architecture', 'Risk-based coverage plan', 'CI quality gates'], 'Quality assessment with targeted implementation support.', 'quality', 70, true, null, null, seed_actor, seed_actor),
  ('technical-consulting-support', 'Technical consulting and support', 'Add experienced product and engineering guidance to a defined initiative.', '', 'Critical programmes sometimes need independent technical framing, review, or temporary specialist capacity.', 'Architecture review, delivery planning, technical facilitation, risk review, and team enablement.', array['Review findings', 'Decision support', 'Action plan', 'Knowledge-transfer sessions'], 'Advisory retainer, focused review, or time-bounded delivery support.', 'consulting', 80, true, null, null, seed_actor, seed_actor)
  on conflict (slug) do nothing;

  insert into public.pricing_plans (
    name, slug, label, target_user, description, features, limitations,
    cta_label, cta_href, featured, sort_order, active, created_by, updated_by
  ) values
  ('Starter', 'starter', 'Indicative package', 'Teams defining a first, narrow AI-assisted workflow', 'A discovery-led package for clarifying the use case, controls, and evaluation approach before a build commitment.', array['Workflow discovery', 'Pilot definition', 'Risk and data-context review', 'Implementation estimate'], array['No production platform access', 'Integration development scoped separately'], 'Discuss a starter engagement', '/contact', false, 10, true, seed_actor, seed_actor),
  ('Growth', 'growth', 'Custom quote', 'Delivery teams ready to prototype a governed agent workflow', 'A phased design and prototype engagement with review checkpoints and an explicit production-readiness decision.', array['Everything in Starter', 'Solution and integration design', 'Prototype implementation', 'Evaluation and handoff plan'], array['Scope depends on selected systems', 'Production operations require separate approval'], 'Scope a prototype', '/contact', true, 20, true, seed_actor, seed_actor),
  ('Enterprise', 'enterprise', 'Contact for pricing', 'Organizations coordinating multiple teams, systems, or governance requirements', 'A tailored programme for platform architecture, integrations, controls, enablement, and staged adoption.', array['Multi-workflow roadmap', 'Enterprise integration architecture', 'Governance and operating model', 'Delivery and enablement support'], array['Commercial terms require discovery', 'Certifications and controls are not implied'], 'Plan an enterprise discovery', '/contact', false, 30, true, seed_actor, seed_actor)
  on conflict (slug) do nothing;

  insert into public.content_revisions (
    entity_type, entity_id, actor_user_id, action, previous_data, new_data
  )
  select source.entity_type, source.id, seed_actor, 'CREATED', null, source.snapshot
  from (
    select 'posts'::text as entity_type, post.id, to_jsonb(post) as snapshot from public.posts as post
    union all
    select 'services', service.id, to_jsonb(service) from public.services as service
    union all
    select 'pricing_plans', plan.id, to_jsonb(plan) from public.pricing_plans as plan
  ) as source
  where not exists (
    select 1 from public.content_revisions as revision
    where revision.entity_type = source.entity_type
      and revision.entity_id = source.id
  );
end;
$$;
