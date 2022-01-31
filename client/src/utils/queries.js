import { gql } from "@apollo/client";

export const GET_ME = gql`
  query user($_id: ID!) {
    user(_id: $_id) {
      _id
      username
      email
      bookCount
      saveBooks
    }
  }
`;
