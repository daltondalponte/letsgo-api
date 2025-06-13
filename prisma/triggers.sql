CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* FUNÇÃO E GATILHO PARA TORNAR O CRIADOR DO EVENTO UM GERENTE TOTAL */
CREATE OR REPLACE FUNCTION insert_events_manager()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO events_manager (id, useruid, event_id, recursos, updated_at)
  VALUES (uuid_generate_v4(), NEW.useruid, NEW.id, ARRAY ['CUPOMINSERT', 'CUPOMDELETE', 'CUPOMUPDATE', 'EVENTUPDATE', 'TICKETINSERT', 'TICKETUPDATE', 'TICKETDELETE', 'CUPOMATTACH']::"Recurso"[], CURRENT_TIMESTAMP);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER events_after_insert
AFTER INSERT
ON events
FOR EACH ROW
EXECUTE FUNCTION insert_events_manager();
/* FIM */

/* FUNÇÃO E GATILHO PARA REGISTRAR UM CUPOM APLICADO EM UMA COMPRA DE TICKET */
-- Criação da função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION after_ticket_sale_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se há um cupomId no NEW
  IF NEW.cupom_id IS NOT NULL THEN
    -- Se houver, insere na tabela CuponsAplicados
    INSERT INTO cupons_aplicados (id, ticket_sale_id, cupom_Id, updated_at)
    VALUES (uuid_generate_v4(), NEW.id, NEW.cupom_id, CURRENT_TIMESTAMP);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criação do trigger que chamará a função após um INSERT na tabela TicketSale
CREATE TRIGGER after_ticket_sale_insert_trigger
AFTER INSERT ON tickets_sale
FOR EACH ROW
EXECUTE FUNCTION after_ticket_sale_insert();
/* FIM */

/*Função para decrementar os cupons disponiveis*/
-- Criar a função trigger para decrementar a quantidade disponível do cupom
CREATE OR REPLACE FUNCTION decrementar_quantidade_disponivel_cupons_aplicados()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrementar a quantidade disponível do cupom associado
  UPDATE cupons SET quantity_available = quantity_available - 1 WHERE id = NEW.cupom_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o gatilho (trigger) para a tabela "CuponsAplicados"
CREATE TRIGGER trigger_decrementar_quantidade_cupons_aplicados
AFTER INSERT ON cupons_aplicados
FOR EACH ROW EXECUTE FUNCTION decrementar_quantidade_disponivel_cupons_aplicados();
/* Fim */

/* FUNÇÃO E GATILHO PARA REGISTRAR UM CUPOM APLICADO EM UMA COMPRA DE TICKET */
-- Criação da função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION after_event_approvals_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVE' THEN
    UPDATE events 
    SET is_active = true
    WHERE id = NEW.event_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criação do trigger que chamará a função após um INSERT na tabela TicketSale
CREATE TRIGGER after_event_approvals_insert_trigger
AFTER INSERT ON events_approvals
FOR EACH ROW
EXECUTE FUNCTION after_event_approvals_insert();
/* FIM */