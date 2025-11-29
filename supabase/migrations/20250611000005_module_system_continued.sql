DROP TRIGGER IF EXISTS update_user_answers_updated_at ON user_answers;
CREATE TRIGGER update_user_answers_updated_at 
  BEFORE UPDATE ON user_answers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_practical_exercises_updated_at ON practical_excercises;
CREATE TRIGGER update_practical_exercises_updated_at 
  BEFORE UPDATE ON practical_excercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_supporting_questions_updated_at ON supporting_questions;
CREATE TRIGGER update_supporting_questions_updated_at 
  BEFORE UPDATE ON supporting_questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
