import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  scores = [];

  constructor() { }

  getScores(): any {
    return this.scores.sort((a, b) => b.mark - a.mark);
  }

  putScore(score: any) {
    score.grade = this.getGrade(score.mark);
    this.scores.push(score);
  }

  getGrade(mark: number): string {
    if(mark >= 75) 
      return "A";
    if(mark >= 50)
      return "C";
    return "S";
  }
}
